/* Export all functions you'll want to call with 
google.script.run here -- this will allow our type
definition magic to work, so in your svelte side code
you get clean autocomplete for google.script.run */

export function getActiveUserEmail() {
  const user = Session.getActiveUser();
  return user.getEmail();
}
export function testMe(number: number) {
  return 113 * number;
}

export function foo(s: string) {
  return 7;
}

import { fetchTeacherByEmail } from "./aspen";

export function fetchAspenTeacher () {
  let email = getActiveUserEmail();
  return fetchTeacherByEmail(email);
}


export {    
  fetchAspenCourses,
  fetchLineItems,
  fetchCategories,
  fetchGradingPeriods,  
  createLineItem
} from "./aspen";

export {
  fetchGoogleAssessments,
  fetchGoogleCourses,
  fetchGoogleGrades,
} from "./googleClassroom";
