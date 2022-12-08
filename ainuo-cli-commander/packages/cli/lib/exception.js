import { log, isDebug } from "@ainuotestgroup/utils";

function printLog(e) {
  if (isDebug()) {
    log.error(e);
  } else {
    log.error(e.message);
  }
}

process.on("uncaughtException", (e) => {
  printLog(e);
});

process.on("unhandledRejection", (e) => {
  printLog(e);
});
