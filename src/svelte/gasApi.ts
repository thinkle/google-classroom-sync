
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

     fetchAspenTeacher(): Promise<Promise<User>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<User>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchAspenTeacher();
      });
    },

     fetchAspenCourses(teacher: User): Promise<Promise<Course[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<Course[]>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchAspenCourses(teacher);
      });
    },

     fetchLineItems(course: Course): Promise<Promise<LineItem[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<LineItem[]>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchLineItems(course);
      });
    },

     fetchCategories(course: any): Promise<Promise<Category[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<Category[]>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchCategories(course);
      });
    },

     fetchGradingPeriods(): Promise<Promise<GradingPeriod[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<GradingPeriod[]>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchGradingPeriods();
      });
    },

     createLineItem(id: string, lineItemData: LineItem): Promise<Promise<LineItem>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<LineItem>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .createLineItem(id, lineItemData);
      });
    },

     fetchAspenRoster(classId: string): Promise<Promise<User[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<User[]>) => resolve(result))
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

     fetchGoogleGrades(courseId: any, assessmentId: any): Promise<Grade[]> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Grade[]) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchGoogleGrades(courseId, assessmentId);
      });
    }
}
