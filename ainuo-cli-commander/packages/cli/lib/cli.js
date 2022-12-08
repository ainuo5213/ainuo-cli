import { program } from "commander";
import semver from "semver";
import chalk from "chalk";

import { log } from "@ainuotestgroup/utils";
import pkg from "./pkg.js";

function preAction() {
  checkNodeVersion();
}

const LOWEST_NODE_VERSION = "14.0.0";

function checkNodeVersion() {
  const version = process.version;
  if (!semver.gte(version, LOWEST_NODE_VERSION)) {
    throw new Error(
      chalk.red("node version must be greater than v" + LOWEST_NODE_VERSION)
    );
  }
}

export default function createCli() {
  log.info("start");
  const cliname = Object.keys(pkg.bin)[0];
  program
    .name(cliname)
    .usage("<command> [options]")
    .version(pkg.version)
    .showSuggestionAfterError(true)
    .showHelpAfterError(true)
    .option("d, --debug", "是否开启调试模式", false)

    .hook("preAction", preAction);

  program.on("option:debug", () => {
    if (program.opts().debug) {
      log.verbose("debug", "launch debu mode");
    }
  });
  program.on("command:*", (obj) => {
    log.error("未知的命令: " + obj[0]);
  });

  return program;
}
