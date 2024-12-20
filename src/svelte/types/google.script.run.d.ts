
declare namespace google.script {  
  interface GoogleScriptRun {
      withFailureHandler(callback: (error: Error, object?: any) => void): this;
      withSuccessHandler(callback: (value: any, object?: any) => void): this;
      withUserObject(object: Object): this;
      getActiveUserEmail(): void;
  testMe(number: number): void;
  foo(s: string): void;
  fetchAspenTeacher(): void;
  logApiCall(apiCall: { method: string; url: string; response: string; }): void;
  logGrades(assessmentId: string, grades: { email: string; score: number; timestamp: string; }[]): void;
  getAssessmentConnections(): void;
  getCourseConnections(): void;
  getStudentConnections(): void;
  getGradeLog(assessmentId: string): void;
  getSettings(): void;
  connectAssessments(aspenAssessment: string, googleAssessment: string): void;
  connectCourses(aspenCourse: string, googleCourse: string): void;
  connectStudents(aspenStudent: string, googleStudent: string): void;
  fetchAspenCourses(teacher: User): void;
  fetchLineItems(course: Course): void;
  fetchCategories(course: any): void;
  fetchGradingPeriods(): void;
  createLineItem(id: string, lineItemData: LineItem): void;
  fetchAspenRoster(classId: string): void;
  postGrade(id: any, lineItem: any, student: any, score: any, comment: any): void;
  fetchGoogleAssessments(courseId: any): void;
  fetchGoogleCourses(): void;
  fetchGoogleGrades(courseId: any, assessmentId: any): void
  }
  const run : GoogleScriptRun;

  interface GoogleScriptHost {
  close(): void;
  setHeight(height: number): void;
  setWidth(width: number): void;
  editor: {
    focus(): void;
  };
}
const host : GoogleScriptHost;
  

  interface IUrlLocation {
  hash: string;
  parameter: { [key: string]: any };
  parameters: { [key: string]: any[] };
}

interface GoogleScriptUrl {
  getLocation(callback: (location: IUrlLocation) => void): void;
}
const url : GoogleScriptUrl;
  
}
