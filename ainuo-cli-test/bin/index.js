#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const dedent = require("dedent");
const cli = yargs(hideBin(process.argv));
cli
  .strict()
  .usage("Usage: ainuo-cli-test [command] <options>")
  .demandCommand(
    1,
    "A command is required. Pass --help to see all available commands and options."
  )
  .alias("h", "help")
  .alias("v", "version")
  .wrap(cli.terminalWidth())
  .epilog(
    dedent`       Your own footer description.
  sad`
  )
  .option("debug", {
    requiresArg: true,
    type: "boolean",
    description: "turn on/off debug mode",
    alias: "d",
  })
  .option("registry", {
    type: "string",
    description: "define registry",
    alias: "r",
  })
  .group(["debug", "registry"], "dev option").argv;
