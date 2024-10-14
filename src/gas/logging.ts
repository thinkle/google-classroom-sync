function ConfigInterface() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const userProperties = PropertiesService.getUserProperties();
  const developerEmail = scriptProperties.getProperty("DEVELOPER_EMAIL");
  const configFolderId = scriptProperties.getProperty("CONFIG_FOLDER_ID");

  function shareWithDeveloper(docId) {
    const doc = DriveApp.getFileById(docId);
    doc.addEditor(developerEmail);

    if (configFolderId) {
      const folder = DriveApp.getFolderById(configFolderId);
      let shortcut = DriveApp.createShortcut(doc.getId());
      shortcut.moveTo(folder);
    }
  }

  function createConfigSpreadsheet() {
    const userEmail = Session.getActiveUser().getEmail();
    const sheetName = `Google Classroom Sync Config & Log - ${userEmail}`;
    const sheet = SpreadsheetApp.create(sheetName);
    const sheetId = sheet.getId();

    shareWithDeveloper(sheetId);

    return sheet;
  }

  function getConfigSpreadsheet() {
    const cachedId = userProperties.getProperty("CONFIG_SHEET_ID");
    if (cachedId) {
      try {
        const sheet = SpreadsheetApp.openById(cachedId);
        return sheet;
      } catch (err) {
        console.error(err);
        console.error("Error loading cached sheet with ID ", cachedId);
        userProperties.deleteProperty("CONFIG_SHEET_ID");
        console.error("Deleting bad cached ID ", cachedId);
      }
    }

    const userEmail = Session.getActiveUser().getEmail();
    const sheetName = `Google Classroom Sync Config & Log - ${userEmail}`;
    const files = DriveApp.getFilesByName(sheetName);

    while (files.hasNext()) {
      const file = files.next();
      try {
        let ss = SpreadsheetApp.openById(file.getId());
        userProperties.setProperty("CONFIG_SHEET_ID", file.getId());
        return ss;
      } catch (err) {
        console.info("Unable to load sheet with ID ", file.getId());
        console.info("It may be a shortcut?");
      }
    }
    let ss = createConfigSpreadsheet();
    userProperties.setProperty("CONFIG_SHEET_ID", ss.getId());
    return ss;
  }

  function getConfig(title) {
    const sheet =
      getConfigSpreadsheet().getSheetByName(title) ||
      getConfigSpreadsheet().insertSheet(title);

    function writeValue(key, value) {
      const range = sheet.getRange("A:B");
      const values = range.getValues();
      let found = false;

      for (let i = 0; i < values.length; i++) {
        if (values[i][0] === key) {
          sheet.getRange(i + 1, 2).setValue(value);
          found = true;
          break;
        }
      }

      if (!found) {
        sheet.appendRow([key, value]);
      }
    }

    function readValue(key) {
      const range = sheet.getRange("A:B");
      const values = range.getValues();

      for (let i = 0; i < values.length; i++) {
        if (values[i][0] === key) {
          return values[i][1];
        }
      }

      return null;
    }

    function readAllValues() {
      const range = sheet.getRange("A:B");
      const values = range.getValues();
      const result = {};

      for (let i = 0; i < values.length; i++) {
        result[values[i][0]] = values[i][1];
      }

      return result;
    }

    return {
      writeValue,
      readValue,
      readAllValues,
    };
  }

  function getLogSheet(title, columns) {
    const sheet =
      getConfigSpreadsheet().getSheetByName(title) ||
      getConfigSpreadsheet().insertSheet(title);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(columns);
    }

    function readEntries() {
      const range = sheet.getRange(
        2,
        1,
        sheet.getLastRow() - 1,
        columns.length
      );
      const values = range.getValues();
      return values.map((row) => {
        const entry = {};
        columns.forEach((col, index) => {
          entry[col] = row[index];
        });
        return entry;
      });
    }

    function appendEntry(entry) {
      const row = columns.map((col) => entry[col] || "");
      sheet.appendRow(row);
    }

    function appendEntries(entries) {
      const rows = entries.map((entry) =>
        columns.map((col) => entry[col] || "")
      );
      sheet
        .getRange(sheet.getLastRow() + 1, 1, rows.length, columns.length)
        .setValues(rows);
    }

    return {
      readEntries,
      appendEntry,
      appendEntries,
    };
  }

  function connectCourses(aspenCourse: string, googleCourse: string) {
    const config = getConfig("CourseConnections");
    config.writeValue(aspenCourse, googleCourse);
  }

  function connectAssessments(
    aspenAssessment: string,
    googleAssessment: string,    
  ) {
    const config = getConfig("AssessmentConnections");
    config.writeValue(aspenAssessment, googleAssessment);
  }

  function connectStudents(aspenStudent: string, googleStudent: string) {
    const config = getConfig("StudentLinks");
    config.writeValue(aspenStudent, googleStudent);
  }

  function getCourseConnections(): { [key: string]: string } {
    const config = getConfig("CourseConnections");
    return config.readAllValues();
  }

  function getAssessmentConnections(): { [key: string]: string } {
    const config = getConfig("AssessmentConnections");
    return config.readAllValues();
  }

  function getStudentLinks(): { [key: string]: string } {
    const config = getConfig("StudentLinks");
    return config.readAllValues();
  }

  function logGrades(
    assessmentId: string,
    grades: { email: string; score: number; timestamp: string }[]
  ) {
    const columns = ["timestamp", "email", "score"];
    const logSheet = getLogSheet(`GradesLog_${assessmentId}`, columns);

    logSheet.appendEntries(grades);
  }

  function getGradeLog(
    assessmentId: string
  ): { timestamp: string; email: string; score: string }[] {
    const columns = ["timestamp", "email", "score"];
    const logSheet = getLogSheet(`GradesLog_${assessmentId}`, columns);
    return logSheet.readEntries() as {
      timestamp: string;
      email: string;
      score: string;
    }[];
  }

  function logApiCall(apiCall: {
    method: string;
    url: string;
    response: string;
  }) {
    const columns = ["timestamp", "method", "url", "response"];
    const logSheet = getLogSheet("ApiCallsLog", columns);

    const entry = {
      timestamp: new Date().toISOString(),
      method: apiCall.method,
      url: apiCall.url,
      response: apiCall.response,
    };

    logSheet.appendEntry(entry);
  }

  function getConfigUrl() {
    return getConfigSpreadsheet().getUrl();
  }

  return {
    connectAssessments,
    connectCourses,
    connectStudents,
    getAssessmentConnections,
    getCourseConnections,
    getStudentLinks,
    getConfigUrl,
    logGrades,
    getGradeLog,
    logApiCall,
  };
}

export function getConfigUrl() {
  if (!isGoogleAppsScript()) {
    console.log("getConfigUrl called with no Google Apps Script environment");
    return;
  }
  return ConfigInterface().getConfigUrl();
}

export function connectCourses(aspenCourse: string, googleCourse: string) {
  if (!isGoogleAppsScript()) {
    console.log(
      "connectCourses called with arguments:",      
      aspenCourse,
      googleCourse
    );
    return;
  }
  ConfigInterface().connectCourses(aspenCourse,googleCourse);
}

export function connectAssessments(
  aspenAssessment: string,
  googleAssessment: string  
) {
  if (!isGoogleAppsScript()) {
    console.log(
      "connectAssessments called with arguments:",      
      aspenAssessment,
      googleAssessment
    );
    return;
  }
  ConfigInterface().connectAssessments(aspenAssessment, googleAssessment);
}

export function connectStudents(aspenStudent: string, googleStudent: string) {
  if (!isGoogleAppsScript()) {
    console.log(
      "connectStudents called with arguments:",      
      aspenStudent,
      googleStudent
    );
    return;
  }
  ConfigInterface().connectStudents(aspenStudent, googleStudent);
}

export function getAssessmentConnections(): { [key: string]: string } {
  if (!isGoogleAppsScript()) {
    console.log(
      "getAssessmentConnections called with no Google Apps Script environment"
    );
    return {};
  }
  return ConfigInterface().getAssessmentConnections();
}

export function getCourseConnections(): { [key: string]: string } {
  if (!isGoogleAppsScript()) {
    console.log(
      "getCourseConnections called with no Google Apps Script environment"
    );
    return {};
  }
  return ConfigInterface().getCourseConnections();
}

export function getStudentConnections (): { [key: string]: string } {
  if (!isGoogleAppsScript()) {
    console.log(
      "getStudentConnections called with no Google Apps Script environment"
    );
    return {};
  }
  return ConfigInterface().getStudentLinks();
}

function isGoogleAppsScript() {
  return typeof Session !== "undefined";
}

export function logGrades(
  assessmentId: string,
  grades: { email: string; score: number; timestamp: string }[]
) {
  if (!isGoogleAppsScript()) {
    console.log("logGrades called with arguments:", assessmentId, grades);
    return;
  }
  ConfigInterface().logGrades(assessmentId, grades);
}

export function getGradeLog(
  assessmentId: string
): { timestamp: string; email: string; score: string }[] {
  if (!isGoogleAppsScript()) {
    console.log("getGradeLog called with arguments:", assessmentId);
    return [];
  }
  return ConfigInterface().getGradeLog(assessmentId);
}

export function logApiCall(apiCall: {
  method: string;
  url: string;
  response: string;
}) {
  if (!isGoogleAppsScript()) {
    console.log("logApiCall called with arguments:", apiCall);
    return;
  }
  ConfigInterface().logApiCall(apiCall);
}
export function getSettings () {
  const config = ConfigInterface();
  let assessmentLinks = config.getAssessmentConnections();
  let courseLinks = config.getCourseConnections();
  let studentLinks = config.getStudentLinks();
  return { assessmentLinks, courseLinks, studentLinks };
}