interface User {
  sourcedId: string;
  status: "active" | "inactive"; // Adjust this if there are other possible statuses.
  dateLastModified: string;
  metadata: Record<string, unknown>; // Use an appropriate type if the structure of metadata is known.
  username: string;
  userIds: Array<unknown>; // Specify the type of userIds elements if known.
  enabledUser: boolean;
  givenName: string;
  familyName: string;
  middleName: string | null;
  role: "teacher" | "student" | "administrator"; // Adjust this based on the possible roles in the system.
  identifier: string | null;
  email: string;
  sms: string | null;
  phone: string | null;
  orgs: Org[];
  agents: Array<unknown>; // Specify the type of agents if known.
  grades: string[]; // Adjust if grades are represented differently.
  nameSuffix: string | null;
  birthDate: string | null;
}

interface Org {
  href: string;
  sourcedId: string;
  type: "org"; // Adjust this if there are different types of organizations.
}

interface Course {
  sourcedId: string;
  status: "active" | "tobedeleted";
  dateLastModified: string;
  title: string;
  courseCode: string;
  grades: string[];
  subjects: string[];
  schoolYear: string;
  org: Reference;
}

interface Reference {
  href: string;
  sourcedId: string;
  type: string;
}

interface LineItem {
  sourcedId: string;
  status: "active" | "tobedeleted";
  dateLastModified: string;
  title: string;
  description?: string;
  assignDate?: string;
  dueDate?: string;
  category?: Reference;
  gradingPeriod?: Reference;
  resultValueMin?: number;
  resultValueMax?: number;
}

interface Reference {
  href: string;
  sourcedId: string;
  type: string;
}
