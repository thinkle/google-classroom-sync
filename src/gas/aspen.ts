import { getApiId, getApiKey } from "./secret";
import { httpRequest } from "./util";

export async function testApiCall() {
  let response = await httpRequest(
    "https://jsonplaceholder.typicode.com/posts/1",
    { method: "GET" }
  );
  let json = await response.json();
  return json;
}

async function getAccessToken() {
  const url = "https://ma-innovation.myfollett.com/oauth/rest/v2.0/auth";
  const clientId = getApiId();
  const clientSecret = getApiKey();
  const options = {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(
      clientId
    )}&client_secret=${encodeURIComponent(clientSecret)}`,
  };

  const response = await httpRequest(url, options);
  const data = await response.json();
  return data.access_token; // The token you'll use for subsequent API requests
}

export async function fetchTeachers(): Promise<User[]> {
  const accessToken = await getAccessToken(); // Ensure this function call is awaited or handled with a promise

  const url =
    "https://ma-innovation.myfollett.com/ims/oneroster/v1p1/teachers?limit=100&offset=0&orderBy=asc";
  const response = await httpRequest(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  console.log("Got data: ", data.users);
  return data.users;
}

export async function fetchTeacherByEmail(email: string): Promise<User> {
  const accessToken = await getAccessToken(); // Ensure this function call is awaited or handled with a promise

  const url = `https://ma-innovation.myfollett.com/ims/oneroster/v1p1/teachers?filter=email=${email}`;
  const response = await httpRequest(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  console.log("Got one teacher data: ", data.users);
  return data.users[0];
}

export async function fetchAspenCourses(teacher: User): Promise<Course[]> {
  const accessToken = await getAccessToken();
  const teacherId = teacher.sourcedId;
  const url = `https://ma-innovation.myfollett.com/ims/oneroster/v1p1/teachers/${teacherId}/classes?limit=100&offset=0&orderBy=asc`;

  const response = await httpRequest(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  console.log("Courses fetched: ", data.classes);
  return data.classes;
}

export async function fetchLineItems(course: Course): Promise<LineItem[]> {
  const accessToken = await getAccessToken(); // Make sure this function correctly handles token retrieval
  const courseId = course.sourcedId;
  const url = `https://ma-innovation.myfollett.com/ims/oneroster/v1p1/classes/${courseId}/lineItems?limit=100&offset=0&orderBy=asc`;

  const response = await httpRequest(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch line items: " + (await response.text()));
  }

  const data = await response.json();
  console.log("Line items fetched: ", data.lineItems);
  return data.lineItems;
}

export async function fetchStudents(course: Course): Promise<User[]> {
  const accessToken = await getAccessToken();
  const courseId = course.sourcedId;
  const url = `https://ma-innovation.myfollett.com/ims/oneroster/v1p1/classes/${courseId}/students?limit=100&offset=0&orderBy=asc`;

  const response = await httpRequest(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  console.log("Students fetched: ", data.users);
  return data.users;
}

export async function fetchCategories(course): Promise<Category[]> {
  const accessToken = await getAccessToken(); // Ensuring access token is available
  let classId = course.sourcedId;
  const url = `https://ma-innovation.myfollett.com/ims/oneroster/v1p1/categories?filter=metadata.classId=${classId}`; // URL adjusted as per actual API

  const response = await httpRequest(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories: " + (await response.text()));
  }

  const data = await response.json();

  console.log("Categories fetched: ", data.categories);
  return data.categories; // Assuming the JSON structure has a categories key
}

export async function fetchGradingPeriods(): Promise<GradingPeriod[]> {
  const accessToken = await getAccessToken(); // Ensuring access token is available
  const url = `https://ma-innovation.myfollett.com/ims/oneroster/v1p1/gradingPeriods`; // Adjust URL as necessary

  const response = await httpRequest(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      "Failed to fetch grading periods: " + (await response.text())
    );
  }

  const data = await response.json();
  console.log("Grading periods fetched: ", data.gradingPeriods);
  return data.gradingPeriods; // Assuming the JSON structure has a gradingPeriods key
}

export async function createLineItem(
  course: Course,
  lineItemData: LineItem
): Promise<LineItem> {
  const accessToken = await getAccessToken();
  const url = `https://ma-innovation.myfollett.com/ims/oneroster/v1p1/classes/${course.sourcedId}/lineItems`;

  const response = await httpRequest(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lineItem: lineItemData }), // Ensure that lineItemData is structured correctly
  });

  if (!response.ok) {
    throw new Error("Failed to create line item: " + (await response.text()));
  }

  const data = await response.json();
  console.log("Line item created: ", data.lineItem);
  return data.lineItem;
}
