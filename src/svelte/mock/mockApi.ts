export function getActiveUserEmail(): string {
  return "thinkle@innovationcharter.org";
}

export function testMe(number: number): number {
  return 17;
}

export function foo(s: string): number {
  return 17;
}

export function getApiKey(): string {
  return process.env.VITE_ASPEN_API_SECRET;
}

export function getApiId(): string {
  return process.env.VITE_ASPEN_API_ID;
}

export {
  testApiCall,
  fetchTeachers,
  fetchTeacherByEmail,
  fetchLineItems,
  fetchAspenCourses,
  fetchCategories,
  fetchGradingPeriods,
} from "../../gas/aspen";



export function fetchGoogleAssessments(courseId: any): GoogleAppsScript.Classroom.Schema.CourseWork[] {
  return [
    {
      id : "foo",
      title: "Assessment 1",
    },
    {
      id : "bar",
      title: "Assessment 2",
    },
    {
      id : "baz",
      title: "Assessment 3",
    }
  ];
}

export function fetchGoogleCourses(teacherEmail: any): any[] {
  return [{ id: "foo", title: "Course 1" },
  { id: "bar", title: "Course 2" }]; // TODO: Replace with mock return value of type any[]  
}

export function fetchGoogleGrades(courseId: any, assessmentId: any): Grade[] {
  return []
  
}