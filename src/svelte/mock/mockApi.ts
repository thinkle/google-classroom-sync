export function getActiveUserEmail(): string {
  return "thinkle@example.com";
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
  fetchCourses,
} from "../../gas/aspen";
