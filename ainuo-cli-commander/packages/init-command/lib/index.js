const Command = require("@ainuotestgroup/command");

class InitCommand extends Command {
  get name() {
    return "init";
  }

  get options() {
    return [["-f, --force", "是否强制初始化", false]];
  }

  get description() {
    return "初始化项目";
  }

  action(option) {
    console.log("init", option);
  }

  preAction() {
    console.log("pre");
  }

  postAction() {
    console.log("post");
  }
}

function init(program) {
  return new InitCommand(program);
}

module.exports = init;
