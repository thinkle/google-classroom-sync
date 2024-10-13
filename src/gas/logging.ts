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
        let ss =  SpreadsheetApp.openById(file.getId());
        userProperties.setProperty("CONFIG_SHEET_ID", file.getId());
        return ss;
      } catch (err) {
        console.info('Unable to load sheet with ID ', file.getId());
        console.info('It may be a shortcut?');
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

  function connectCourses(googleCourse : string, aspenCourse : string) {
    const config = getConfig("CourseConnections");
    config.writeValue(googleCourse, aspenCourse);
  }

  function connectAssessments(googleAssessment : string, aspenAssessment : string) {
    const config = getConfig("AssessmentConnections");
    config.writeValue(googleAssessment, aspenAssessment);
  }

  function getCourseConnections() : {[key: string]: string} {
    const config = getConfig("CourseConnections");
    return config.readAllValues();
  }

  function getAssessmentConnections() : {[key: string]: string} {
    const config = getConfig("AssessmentConnections");
    return config.readAllValues();
  }

  function logGrades(assessmentId : string, grades : {email: string, score: number, timestamp : any}[]) {
    const columns = ["timestamp", "email", "score"];
    const logSheet = getLogSheet(`GradesLog_${assessmentId}`, columns);    

    logSheet.appendEntries(entries);
  }

  function getGradeLog(assessmentId : string) : {timestamp: string, email: string, score: string}[] {
    const columns = ["timestamp", "email", "score"];
    const logSheet = getLogSheet(`GradesLog_${assessmentId}`, columns);
    return logSheet.readEntries() as {timestamp : string, email: string, score: string}[];
  }

  function logApiCall(apiCall : {method: string, url: string, response: string}) {
    const columns = ["Timestamp", "Method", "URL", "Response"];
    const logSheet = getLogSheet("ApiCallsLog", columns);

    const entry = {
      Timestamp: new Date().toISOString(),
      Method: apiCall.method,
      URL: apiCall.url,
      Response: apiCall.response,
    };

    logSheet.appendEntry(entry);
  }

  function getConfigUrl() {
    return getConfigSpreadsheet().getUrl();
  }

  return {
    connectCourses,
    connectAssessments,
    getCourseConnections,
    getAssessmentConnections,
    getConfigUrl,
    logGrades,
    getGradeLog,
    logApiCall,
  };
}

export function getConfigUrl() {
  return ConfigInterface().getConfigUrl();
}

export function connectCourses(googleCourse : string, aspenCourse : string) {
  ConfigInterface().connectCourses(googleCourse, aspenCourse);
}

export function connectAssessments(googleAssessment : string, aspenAssessment : string) {
  ConfigInterface().connectAssessments(googleAssessment, aspenAssessment);
}

export function getCourseConnections() : {[key: string]: string} {
  return ConfigInterface().getCourseConnections();
}

export function getAssessmentConnections() : {[key: string]: string} {
  return ConfigInterface().getAssessmentConnections();
}

export function logGrades(assessmentId : string, grades : {studentEmail: string, score: number, Timestamp : string}[]) {
  ConfigInterface().logGrades(assessmentId, grades);
}

export function getGradeLog(assessmentId : string) : {Timestamp: string, StudentEmail: string, Score: string}[] {
  return ConfigInterface().getGradeLog(assessmentId);
}

export function logApiCall(apiCall : {method: string, url: string, response: string}) {
  ConfigInterface().logApiCall(apiCall);
}

export function testConfigInterface() {
  const config = ConfigInterface();
  config.connectAssessments('test-google','test-aspen');
  config.connectCourses('test-google-course','test-aspen-course');
  config.logApiCall({method: 'GET', url: 'http://example.com', response: 'OK'});
  config.logGrades('test-assessment', [{studentEmail: 'foo@bar.com', score: 100}]); 
  console.log('See: '+config.getConfigUrl());
}