#!/usr/bin/env node
const ainuoCliLib = require("ainuo-cli-lib");
const argv = require("process").argv;
const command = argv[2];
if (!command) {
  console.log("请输入命令");
  return;
}
if (command.startsWith("--") || command.startsWith("-")) {
  const globalOption = command.replace(/^(--|-)/, "");
  if (globalOption === "version" || globalOption === "V") {
    console.log("1.0.0");
  }
} else if (ainuoCliLib[command]) {
  let [option, param] = argv.slice(3);
  option = option.replace("--", "");
  ainuoCliLib[command]({
    [option]: param,
  });
} else {
  console.log("暂无" + command + "方法");
}
