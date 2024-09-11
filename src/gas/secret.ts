export function getApiKey() {
  if (typeof PropertiesService !== "undefined") {
    return PropertiesService.getScriptProperties().getProperty(
      "ASPEN_API_SECRET"
    );
  } else {
    // Fallback to environment variable if running outside Google Apps Script
    return process.env.VITE_ASPEN_API_SECRET;
  }
}

export function getApiId() {
  if (typeof PropertiesService !== "undefined") {
    return PropertiesService.getScriptProperties().getProperty("ASPEN_API_ID");
  } else {
    // Fallback to environment variable if running outside Google Apps Script
    return process.env.VITE_ASPEN_API_ID;
  }
}
