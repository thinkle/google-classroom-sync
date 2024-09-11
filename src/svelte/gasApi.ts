
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

     getApiKey(): Promise<string> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: string) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .getApiKey();
      });
    },

     getApiId(): Promise<string> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: string) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .getApiId();
      });
    },

     testApiCall(): Promise<Promise<any>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<any>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .testApiCall();
      });
    },

     fetchTeachers(): Promise<Promise<User[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<User[]>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchTeachers();
      });
    },

     fetchTeacherByEmail(email: string): Promise<Promise<User>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<User>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchTeacherByEmail(email);
      });
    },

     fetchCourses(teacher: User): Promise<Promise<Course[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<Course[]>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchCourses(teacher);
      });
    },

     fetchLineItems(course: Course): Promise<Promise<LineItem[]>> {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: Promise<LineItem[]>) => resolve(result))
          .withFailureHandler((error: any) => reject(error))
          .fetchLineItems(course);
      });
    }
}
