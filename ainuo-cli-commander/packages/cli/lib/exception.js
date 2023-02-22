import {printErrorLog} from "@ainuo-utils/utils";

process.on("uncaughtException", (e) => {
  printErrorLog(e);
});

process.on("unhandledRejection", (e) => {
  printErrorLog(e);
});
