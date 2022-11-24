const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const dedent = require("dedent");
const cli = yargs(hideBin(process.argv));
cli
  .strict()
  .usage("Usage: ainuo-cli-test [command] <options>")
  .recommendCommands()
  .fail((msg, err) => {
    console.log(msg);
    return "xxxx";
  })
  .command(
    "server [port]",
    "start the server",
    (yargs) => {
      yargs.positional("port", {
        description: "server port",
        default: 5000,
      });
    },
    (argv) => {
      console.log(argv);
    }
  )
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
