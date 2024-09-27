import { httpRequest, getProp, setProp } from "./util";

function aspenInterface() {

  /*
  * All code related to our API *must* be encapsulated
  * here, as all top-level functions are exposed in client code
  * and we cannot expose our Aspen API keys or calls directly.
  * Be *very* careful what you expose here and note that things
  * like caching calls and tokens *also* must be encapsulated. 
  */

  const TOKEN_KEY = "aspen_access_token";
  const EXPIRATION_KEY = "aspen_token_expiration";
  function getApiKey() {
    if (typeof PropertiesService !== "undefined") {
      return PropertiesService.getScriptProperties().getProperty(
        "ASPEN_API_SECRET"
      );
    } else {
      // Fallback to environment variable if running outside Google Apps Script
      return process.env.VITE_ASPEN_API_SECRET;
    }
  }

  function getApiId() {
    if (typeof PropertiesService !== "undefined") {
      return PropertiesService.getScriptProperties().getProperty(
        "ASPEN_API_ID"
      );
    } else {
      // Fallback to environment variable if running outside Google Apps Script
      return process.env.VITE_ASPEN_API_ID;
    }
  }

  // Utility functions, but they could be used to bypass
  // our security so they must be encapsulated here.
  function getProp(key: string): string | null {
    if (typeof PropertiesService !== "undefined") {
      const properties = PropertiesService.getScriptProperties();
      return properties.getProperty(key);
    } else if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  }

  function setProp(key: string, value: string): void {
    if (typeof PropertiesService !== "undefined") {
      const properties = PropertiesService.getScriptProperties();
      properties.setProperty(key, value);
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
  }



  async function getAccessToken() {
    const now = Date.now();

    // Get token and expiration from the appropriate storage
    const cachedToken = getProp(TOKEN_KEY);
    const tokenExpiration = parseInt(getProp(EXPIRATION_KEY) || "0");

    // Check if the token is cached and still valid
    if (cachedToken && tokenExpiration && now < tokenExpiration) {
      console.log("Using cached token");
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

  async function testApiCall() {
    let response = await httpRequest(
      "https://jsonplaceholder.typicode.com/posts/1",
      { method: "GET" }
    );
    let json = await response.json();
    return json;
  }

  async function fetchTeachers(): Promise<User[]> {
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

  /* Access control system: ensure that teachers can only access
     their own courses, students and grades. 
     The Aspen API does *not* enforce this limitation, so we must
     be extremely careful to enforce it ourselves.
  */

  async function hasAccessToCourse (courseId: string) : Promise<boolean> {
    if (typeof Session == "undefined") {
      // override -- local testing environment
      return true;
    }
    let authorizedEmail = Session.getActiveUser().getEmail();
    let authorizedTeacher = await fetchTeacherByEmail(authorizedEmail);
    let authorizedCourses = await fetchAspenCourses(authorizedTeacher);
    if (authorizedCourses.find(course => course.sourcedId == courseId)) {
      return true;
    } else {
      console.error('Teacher', authorizedTeacher, 'does not have access to course', courseId);
      return false;
    }
    return false;
  }

  async function hasAccessToLineItem (lineItemId : string) : Promise<boolean> {
    if (typeof Session == "undefined") {
      // override -- local testing environment
      return true;
    }
    // We don't trust that the lineItem is what it says it is, so let's fetch it...
    const url = `https://ma-innovation.myfollett.com/ims/oneroster/v1p1/lineItems/${lineItemId}`;
    const accessToken = await getAccessToken();
    const response = await httpRequest(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      }});
    const data = await response.json();
    let lineItem = data.lineItem;
    let courseId = lineItem.class.sourcedId;
    return hasAccessToCourse(courseId);    
  }

  async function fetchTeacherByEmail(email: string): Promise<User> {
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

  async function fetchAspenCourses(teacher: User): Promise<Course[]> {
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

  async function fetchLineItems(course: Course): Promise<LineItem[]> {
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

  async function fetchStudents(course: Course): Promise<User[]> {
    if (!hasAccessToCourse(course.sourcedId)) {
      throw new Error("Unauthorized access to student data");
    }
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

  async function fetchCategories(course): Promise<Category[]> {
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

  async function fetchGradingPeriods(): Promise<GradingPeriod[]> {
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

  async function createLineItem(
    id: string,
    lineItemData: LineItem
  ): Promise<LineItem> {
    let courseId = lineItemData.class.sourcedId;
    if (!hasAccessToCourse(courseId)) {
      throw new Error("Unauthorized access to course data");
    }
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

  async function fetchAspenRoster(classId: string): Promise<User[]> {
    // Security layer...
    if (!hasAccessToCourse(classId)) {
      throw new Error("Unauthorized access to roster data");
    }
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

  async function postResult(resultId: string, resultData: any): Promise<any> {
    let lineItemId = resultData.result.lineItem.sourcedId;
    if (!hasAccessToLineItem(lineItemId)) {
      throw new Error("Unauthorized access to line item data");
    }


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

  async function postGrade(id, lineItem, student, score, comment) {
    let resultObject = {
      result: {
        lineItem: {
          sourcedId: lineItem.sourcedId,
          href: lineItem.href,
          type: lineItem.type,
        },
        student: {
          sourcedId: student.sourcedId,
          href: student.href,
          type: student.type,
        },
        score: score,
        comment: comment,
      },
    };
    let data = await postResult(id, resultObject);
    return data;
  }

  return {
    testApiCall, // no enforcement needed -- data not private
    fetchTeacherByEmail, // enforces email
    fetchAspenCourses, // enforces teacher
    fetchLineItems, // enforces course -> teacher
    fetchStudents, // enforces course -> teacher
    fetchCategories, // no enforcement needed -- data not private
    fetchGradingPeriods, // no enforcement needed -- data not private
    createLineItem, // enforces course -> teacher
    fetchAspenRoster, // enforces course -> teacher
    postGrade, // enforces line item -> course -> teacher
  };
}

// Expose the public interface
const aspenAPI = aspenInterface();

export function testApiCall() {
  return aspenAPI.testApiCall();
}

export function fetchTeacherByEmail(email: string): Promise<User> {
  return aspenAPI.fetchTeacherByEmail(email);
}

export function fetchAspenCourses(teacher: User): Promise<Course[]> {
  return aspenAPI.fetchAspenCourses(teacher);
}

export function fetchLineItems(course: Course): Promise<LineItem[]> {
  return aspenAPI.fetchLineItems(course);
}

export function fetchStudents(course: Course): Promise<User[]> {
  return aspenAPI.fetchStudents(course);
}

export function fetchCategories(course): Promise<Category[]> {
  return aspenAPI.fetchCategories(course);
}

export function fetchGradingPeriods(): Promise<GradingPeriod[]> {
  return aspenAPI.fetchGradingPeriods();
}

export function createLineItem(id: string, lineItemData: LineItem): Promise<LineItem> {
  return aspenAPI.createLineItem(id, lineItemData);
}

export function fetchAspenRoster(classId: string): Promise<User[]> {
  return aspenAPI.fetchAspenRoster(classId);
}

export function postResult(resultId: string, resultData: any): Promise<any> {
  return aspenAPI.postResult(resultId, resultData);
}

export function postGrade(id, lineItem, student, score, comment) {
  return aspenAPI.postGrade(id, lineItem, student, score, comment);
}