import { log, isDebug, printErrorLog } from "@ainuotestgroup/utils";

process.on("uncaughtException", (e) => {
  printErrorLog(e);
});

process.on("unhandledRejection", (e) => {
  printErrorLog(e);
});
