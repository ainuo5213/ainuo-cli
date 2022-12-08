import Command from "@ainuotestgroup/command";
import { log } from "@ainuotestgroup/utils";

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

  action(name, option) {
    log.verbose("init", name, option);
  }

  preAction() {
    log.success("pre");
  }

  postAction() {
    log.success("post");
  }
}

export default function init(program) {
  return new InitCommand(program);
}
