import Command from "@ainuotestgroup/command";
import { log } from "@ainuotestgroup/utils";

import createTemplate from "./createTemplate.js";

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

  action(name, options) {
    // 选择项目模板，生成项目信息
    createTemplate(name, options);
    // 下载模板到缓存目录
    // 安装项目模板到项目目录
  }
}

export default function init(program) {
  return new InitCommand(program);
}
