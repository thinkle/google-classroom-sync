import { getApiId, getApiKey } from "./secret";
import { httpRequest, getProp, setProp } from "./util";

const TOKEN_KEY = 'aspen_access_token';
const EXPIRATION_KEY = 'aspen_token_expiration';

export async function testApiCall() {
  let response = await httpRequest(
    "https://jsonplaceholder.typicode.com/posts/1",
    { method: "GET" }
  );
  let json = await response.json();
  return json;
}

async function getAccessToken() {
  const now = Date.now();

  // Get token and expiration from the appropriate storage
  const cachedToken = getProp(TOKEN_KEY);
  const tokenExpiration = parseInt(getProp(EXPIRATION_KEY) || "0");

  // Check if the token is cached and still valid
  if (cachedToken && tokenExpiration && now < tokenExpiration) {
    console.log('Using cached token');
    return cachedToken;
  }

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
  const expiresIn = data.expires_in || 3600; // Default to 1 hour if not provided

  // Cache the token and its expiration time
  const newToken = data.access_token;
  const newExpiration = now + expiresIn * 1000; // Convert expiresIn to milliseconds

  setProp(TOKEN_KEY, newToken);
  setProp(EXPIRATION_KEY, newExpiration.toString());

  return newToken;
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
  // Security layer...
  let teacherEmail = teacher.email;
  if (typeof Session !== "undefined") {
    let loggedInEmail = Session.getActiveUser().getEmail();
    
    if (teacherEmail !== loggedInEmail) {
      throw new Error("Unauthorized access to teacher data");
    }
  }
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
  id : string,
  lineItemData: LineItem
): Promise<LineItem> {
  const accessToken = await getAccessToken();
  const url = `https://ma-innovation.myfollett.com/ims/oneroster/v1p1/lineItems/${id}`;

  const response = await httpRequest(url, {
    method: "PUT",
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

export async function fetchAspenRoster (classId: string): Promise<User[]> {
  const accessToken = await getAccessToken();
  const url = `https://ma-innovation.myfollett.com/ims/oneroster/v1p1/classes/${classId}/students?limit=100&offset=0&orderBy=asc`;

  const response = await httpRequest(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch students: " + (await response.text()));
  }

  const data = await response.json();
  console.log("Students fetched: ", data.users);
  return data.users;
}

export async function postResult(resultId: string, resultData: any): Promise<any> {
  const accessToken = await getAccessToken();
  const url = `https://ma-innovation.myfollett.com/ims/oneroster/v1p1/results/${resultId}`;

  const response = await httpRequest(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resultData),
  });

  if (!response.ok) {
    throw new Error("Failed to post result: " + (await response.text()));
  }

  const data = await response.json();
  console.log("Result posted: ", data);
  return data;
}

export async function postGrade (
  id, lineItem, student, score, comment
) {
  let resultObject = {
    result : {
      lineItem : {
        sourcedId : lineItem.sourcedId,
        href: lineItem.href,
        type : lineItem.type
      },
      student : {
        sourcedId : student.sourcedId,
        href: student.href,
        type : student.type
      },
      score : score,
      comment : comment
    
    }
  };
  let data = await postResult(id, resultObject);
  return data;
}