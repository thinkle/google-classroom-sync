
export const GoogleAppsScript = {
  
     getActiveUserEmail(): Promise<string> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: string) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .getActiveUserEmail();
      });
    },

     testMe(number: number): Promise<number> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: number) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .testMe(number);
      });
    },

     foo(s: string): Promise<number> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: number) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .foo(s);
      });
    },

     fetchAspenTeacher(): Promise<Promise<import("../gas/types").User>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<import("../gas/types").User>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchAspenTeacher();
      });
    },

     logApiCall(apiCall: { method: string; url: string; response: string; }): Promise<void> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: void) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .logApiCall(apiCall);
      });
    },

     logGrades(assessmentId: string, grades: { email: string; score: number; timestamp: string; }[]): Promise<void> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: void) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .logGrades(assessmentId, grades);
      });
    },

     getAssessmentConnections(): Promise<{ [key: string]: string; }> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: { [key: string]: string; }) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .getAssessmentConnections();
      });
    },

     getCourseConnections(): Promise<{ [key: string]: string; }> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: { [key: string]: string; }) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .getCourseConnections();
      });
    },

     getStudentConnections(): Promise<{ [key: string]: string; }> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: { [key: string]: string; }) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .getStudentConnections();
      });
    },

     getGradeLog(assessmentId: string): Promise<{ timestamp: string; email: string; score: string; }[]> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: { timestamp: string; email: string; score: string; }[]) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .getGradeLog(assessmentId);
      });
    },

     getSettings(): Promise<{ assessmentLinks: { [key: string]: string; }; courseLinks: { [key: string]: string; }; studentLinks: { [key: string]: string; }; }> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: { assessmentLinks: { [key: string]: string; }; courseLinks: { [key: string]: string; }; studentLinks: { [key: string]: string; }; }) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .getSettings();
      });
    },

     connectAssessments(aspenAssessment: string, googleAssessment: string): Promise<void> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: void) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .connectAssessments(aspenAssessment, googleAssessment);
      });
    },

     connectCourses(aspenCourse: string, googleCourse: string): Promise<void> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: void) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .connectCourses(aspenCourse, googleCourse);
      });
    },

     connectStudents(aspenStudent: string, googleStudent: string): Promise<void> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: void) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .connectStudents(aspenStudent, googleStudent);
      });
    },

     fetchAspenCourses(teacher: import("/Users/thinkle/Projects/google-classroom-sync/src/gas/types").User): Promise<Promise<import("../gas/types").Course[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<import("../gas/types").Course[]>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchAspenCourses(teacher);
      });
    },

     fetchLineItems(course: import("/Users/thinkle/Projects/google-classroom-sync/src/gas/types").Course): Promise<Promise<import("../gas/types").LineItem[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<import("../gas/types").LineItem[]>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchLineItems(course);
      });
    },

     fetchCategories(course: any): Promise<Promise<import("../gas/types").Category[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<import("../gas/types").Category[]>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchCategories(course);
      });
    },

     fetchGradingPeriods(): Promise<Promise<import("../gas/types").GradingPeriod[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<import("../gas/types").GradingPeriod[]>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchGradingPeriods();
      });
    },

     createLineItem(id: string, lineItemData: import("/Users/thinkle/Projects/google-classroom-sync/src/gas/types").LineItem): Promise<Promise<import("../gas/types").LineItem>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<import("../gas/types").LineItem>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .createLineItem(id, lineItemData);
      });
    },

     fetchAspenRoster(classId: string): Promise<Promise<import("../gas/types").User[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<import("../gas/types").User[]>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchAspenRoster(classId);
      });
    },

     postGrade(id: any, lineItem: any, student: any, score: any, comment: any): Promise<Promise<any>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<any>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .postGrade(id, lineItem, student, score, comment);
      });
    },

     fetchGoogleAssessments(courseId: any): Promise<GoogleAppsScript.Classroom.Schema.CourseWork[]> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: GoogleAppsScript.Classroom.Schema.CourseWork[]) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchGoogleAssessments(courseId);
      });
    },

     fetchGoogleCourses(): Promise<any[]> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: any[]) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchGoogleCourses();
      });
    },

     fetchGoogleGrades(courseId: any, assessmentId: any): Promise<import("../gas/types").Grade[]> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: import("../gas/types").Grade[]) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchGoogleGrades(courseId, assessmentId);
      });
    },

     fetchRubric(courseId: any, assessmentId: any): Promise<import("../gas/types").Rubric> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: import("../gas/types").Rubric) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchRubric(courseId, assessmentId);
      });
    }
}
