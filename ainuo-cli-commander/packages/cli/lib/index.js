const { program } = require("commander");
const pkg = require("../package.json");
const createInitCommand = require("@ainuotestgroup/init-command");

module.exports = function (argv) {
  const cliname = Object.keys(pkg.bin)[0];
  program
    .name(cliname)
    .usage("<command> [options]")
    .version(pkg.version)
    .showSuggestionAfterError(true)
    .showHelpAfterError(true)
    .option("d, --debug", "是否开启调试模式", false);

  createInitCommand(program);

  program.parse(process.argv);
};
