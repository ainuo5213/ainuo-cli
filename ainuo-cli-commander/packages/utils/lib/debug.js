import log from "./log.js";

export default function isDebug() {
  return process.argv.includes("--debug") || process.argv.includes("-d");
}

export function printErrorLog(e) {
  if (isDebug()) {
    log.error(e);
  } else {
    log.error(e.message);
  }
}
