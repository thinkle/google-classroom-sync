import { Grade, Rubric, RubricGrade } from "./types";

export function fetchGoogleCourses() {
  let teacherEmail = Session.getActiveUser().getEmail();
  var courses = [];
  var response = Classroom.Courses.list({
    teacherId: teacherEmail,
    pageSize: 100,
    courseStates: ["ACTIVE"],
    // Adjust the pageSize according to your needs
  });
  if (response.courses && response.courses.length > 0) {
    courses = response.courses.map((course) => ({
      id: course.id,
      name: course.name,
      ownerId: course.ownerId,
      state: course.courseState,
    }));
  }
  console.log(
    "Courses fetched for %s: %s",
    teacherEmail,
    JSON.stringify(courses)
  );
  return courses;
}

export function fetchGoogleAssessments(
  courseId
): GoogleAppsScript.Classroom.Schema.CourseWork[] {
  var assessments = [];
  var response = Classroom.Courses.CourseWork.list(courseId);
  assessments = response.courseWork;
  return assessments;
}

export function fetchGoogleSubmissions(
  courseId,
  assessmentId
): GoogleAppsScript.Classroom.Schema.StudentSubmission[] {
  var submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(
    courseId,
    assessmentId
  ).studentSubmissions;
  Logger.log(
    "Grades fetched for assessment %s in course %s: %s",
    assessmentId,
    courseId,
    JSON.stringify(submissions)
  );
  return submissions;
}

const rubricCache = {};

export function fetchRubric(courseId, assessmentId): Rubric | undefined {
  let cacheKey = `${courseId}-${assessmentId}`;
  if (rubricCache[cacheKey]) {
    return rubricCache[cacheKey];
  } else {
    let theRubric = fetchRubricManually(courseId, assessmentId);
    rubricCache[cacheKey] = theRubric;
    return theRubric;
  }
}

export function fetchRubricManually(
  courseId,
  assessmentId
): Rubric | undefined {
  let response = Classroom.Courses.CourseWork.Rubrics.list(
    courseId,
    assessmentId
  );
  if (!response.rubrics?.length) return;

  let rubric = response.rubrics[0];
  // there will only be one...
  let theRubric: Rubric = {
    id: rubric.id,
    courseId: rubric.courseId,
    criteriaMap: {},
    criteria: rubric.criteria.map((criterion) => ({
      description: criterion.description,
      levelsMap: {},
      title: criterion.title,
      jsonDebugging: JSON.stringify(criterion),
      id: criterion.id,
      levels: criterion.levels.map((level) => ({
        description: level.getDescription(),
        points: level.points,
        id: level.id,
        title: level.title,
      })),
    })),
  };
  theRubric.criteria.forEach((criterion) => {
    theRubric.criteriaMap[criterion.id] = criterion;
    criterion.levels.forEach((level) => {
      criterion.levelsMap[level.id] = level;
    });
  });
  return theRubric;
}

type RubricMap = {
  [key: string]: {
    criterionId: string;
    points: number;
    levelId: string;
  };
};

function mapRubricGrades(rubricMap: RubricMap, rubric: Rubric): RubricGrade[] {
  let rubricGrades: RubricGrade[] = [];
  for (let key in rubricMap) {
    let grade = rubricMap[key];
    let points = grade.points; // not from the level because teachers can assign intermediate scores
    let criterion = rubric.criteriaMap[grade.criterionId];
    let level = criterion.levelsMap[grade.levelId];
    rubricGrades.push({
      criterion: criterion?.title,
      level: level?.title,
      description: level?.description,
      points,
      criterionId: key,
      levelId: grade.levelId,
    });
  }
  return rubricGrades;
}

export function fetchGoogleGrades(courseId, assessmentId): Grade[] {
  // Step 1: Fetch CourseWork to get maxPoints
  var coursework = Classroom.Courses.CourseWork.get(courseId, assessmentId);
  var maxPoints = coursework.maxPoints;
  var rubric = fetchRubric(courseId, assessmentId);

  // Step 2: Fetch submissions
  var submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(
    courseId,
    assessmentId
  ).studentSubmissions;

  // Step 3: Compile detailed grades info
  var grades = submissions.map((submission) => {
    // Assuming each student submission has a userId to fetch user details
    var studentDetails = Classroom.UserProfiles.get(submission.userId);

    // Note: the submission object has on it an object called
    // assignedRubricGrades and draftRubricGrades, that object is keyed by
    // criterionId and has the following structure:
    //
    // {
    //   NzQaweoir : {
    //     criterionId: "NzQaweoir",
    //     points: 2,
    //     levelId: 'aoseiurasldkjr',
    //   }

    // Extract the grade history from submissionHistory
    let rubricGrades = [];
    if (submission.assignedRubricGrades) {
      rubricGrades = mapRubricGrades(submission.assignedRubricGrades, rubric);
    }

    var gradeHistory = [];
    var stateHistory = [];
    var lastGradeChangeTimestamp = null;
    if (
      submission.submissionHistory &&
      submission.submissionHistory.length > 0
    ) {
      for (var i = 0; i < submission.submissionHistory.length; i++) {
        var history = submission.submissionHistory[i];
        if (
          history.gradeHistory &&
          history.gradeHistory.gradeChangeType !==
            "DRAFT_GRADE_POINTS_EARNED_CHANGE"
        ) {
          gradeHistory.push(history.gradeHistory);
          lastGradeChangeTimestamp = history.gradeHistory.gradeTimestamp;
        }
        if (history.stateHistory) {
          stateHistory.push(history.stateHistory);
        }
      }
    }

    // Check if the grade has changed
    var comments = "";

    if (gradeHistory.length > 1) {
      for (var j = 0; j < gradeHistory.length; j++) {
        var change = gradeHistory[j];
        var date = new Date(change.gradeTimestamp).toLocaleDateString();
        if (j === 0) {
          comments += date + " : " + (change.pointsEarned || "No Grade");
        } else {
          comments += "\n" + date + " : Revised to " + change.pointsEarned;
        }
      }
    }

    return {
      studentEmail: studentDetails.emailAddress,
      studentName: studentDetails.name.fullName, // or format as last, first
      assignedGrade: submission.assignedGrade, // Handle missing grades
      draftGrade: submission.draftGrade, // Handle draft grades
      maximumGrade: maxPoints,
      submissionState: submission.state, // Returned, Missing, etc.
      late: submission.late, // Boolean value
      gradeHistory: gradeHistory,
      stateHistory: stateHistory,
      comment: comments,
      lastGradeChangeTimestamp: lastGradeChangeTimestamp,
      rubricGrades: rubricGrades,
    };
  });

  console.log(
    "Detailed grades for assessment %s in course %s: %s",
    assessmentId,
    courseId,
    JSON.stringify(grades)
  );

  return grades;
}

function testGoogleClassroom() {
  var teacherEmail = "thinkle@innovationcharter.org";
  var courses = fetchGoogleCourses(teacherEmail);
  var theCourse = courses[0];
  console.log("The course is ", theCourse.name);
  var assessments = fetchGoogleAssessments(theCourse.id);

  console.log("Fetched ", assessments.length, "assessments");

  let theAssessment = assessments[6];
  console.log(
    "Assessment ",
    theAssessment.title,
    "max score:",
    theAssessment.maxPoints
  );
  let theGrades = fetchGoogleGrades(theCourse.id, theAssessment.id);
  console.log("Grades: ", theGrades);
}

function getLastChange(submission) {
  if (submission.submissionHistory && submission.submissionHistory.length > 0) {
    return (
      submission.submissionHistory[submission.submissionHistory.length - 1]
        .stateHistory || { state: "No State" }
    );
  }
  return { state: "Missing" };
}
