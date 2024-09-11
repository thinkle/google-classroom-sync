const IDX = "index.html"; // file name for svelte output
const APPNAME = `My App`;

import { getAddOnEnvironment } from "./addOn";

export function doGet(e) {
  return HtmlService.createHtmlOutputFromFile(IDX);
}
