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
  Logger.log(
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

type Grade = {
  studentEmail: string;
  studentName: string;
  assignedGrade: number | null;
  maximumGrade: number;
  submissionState: string;
  late: boolean;
};

export function fetchGoogleGrades(courseId, assessmentId): Grade[] {
  // Step 1: Fetch CourseWork to get maxPoints
  var coursework = Classroom.Courses.CourseWork.get(courseId, assessmentId);
  var maxPoints = coursework.maxPoints;
  // Step 2: Fetch submissions
  var submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(
    courseId,
    assessmentId
  ).studentSubmissions;

  // Step 3: Compile detailed grades info
  var grades = submissions.map((submission) => {
    // Assuming each student submission has a userId to fetch user details
    var studentDetails = Classroom.UserProfiles.get(submission.userId);

    return {
      studentEmail: studentDetails.emailAddress,
      studentName: studentDetails.name.fullName, // or format as last, first
      assignedGrade: submission.assignedGrade, // Handle missing grades
      maximumGrade: maxPoints,
      submissionState: submission.state, // Returned, Missing, etc.
      late: submission.late, // Boolean value
    };
  });

  Logger.log(
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
  var theCourse = courses[2];
  console.log("The course is ", theCourse.name);
  var assessments = fetchGoogleAssessments(theCourse.id);

  console.log("Fetched ", assessments.length, "assessments");

  let theAssessment = assessments[0];
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
