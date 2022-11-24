#!/usr/bin/env node
const { Command } = require("commander");
const pkg = require("../package.json");

const program = new Command();
program
  .name(Object.keys(pkg.bin)[0])
  .usage("<command> [options]")
  .version(pkg.version)
  .option("-d, --debug", "是否开启调试模式", false)
  .option("-e, --env <envName>", "获取环境变量名称");

const cloneCommand = program
  .command("clone <source> [destination]")
  .option("-f, --force", "是否强制克隆到本低")
  .description("clone a repository into a newly created directory")
  .action((source, destination, options) => {
    console.log(
      "clone command called source: " + source + ". dest: " + destination
    );
    console.log(options);
  });

const service = new Command("service");
service
  .command("start [port]")
  .description("start server at some port")
  .action((port) => {
    console.log("do service start at " + port);
  });
service
  .command("stop")
  .description("stop service")
  .action(() => {
    console.log("stop service");
  });
program.addCommand(service);
program.parse(process.argv);
