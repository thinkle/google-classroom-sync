export async function httpRequest(url, options) {
  if (typeof UrlFetchApp !== "undefined") {
    // Google Apps Script environment
    try {
      const response = UrlFetchApp.fetch(url, {
        method: options.method || "GET",
        payload: options.body,
        headers: options.headers,
        muteHttpExceptions: true,
      });
      const textResponse = response.getContentText();
      const jsonResponse = () => Promise.resolve(JSON.parse(textResponse));
      return {
        json: jsonResponse,
        text: () => Promise.resolve(textResponse),
        status: response.getResponseCode(),
        ok:
          response.getResponseCode() >= 200 && response.getResponseCode() < 300,
      };
    } catch (error) {
      return {
        json: () => Promise.reject(error),
        text: () => Promise.reject(error),
        status: 500,
        ok: false,
      };
    }
  } else {
    // Local JavaScript environment using fetch
    if (url.startsWith("https://ma-innovation.myfollett.com")) {
      url = url.replace("https://ma-innovation.myfollett.com", "/aspen");
    }
    const response = await fetch(url, options);
    return response;
  }
}
