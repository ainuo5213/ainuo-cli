import Command from "@ainuotestgroup/command";
import createTemplate from "./createTemplate.js";
import downloadTemplate from "./downloadTemplate.js";
import installTemplate from "./installTemplate.js";

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

  async action(options) {
    // 选择项目模板，生成项目信息
    const selectedTemplate = await createTemplate();
    // 下载模板到缓存目录
    downloadTemplate(selectedTemplate);
    // 安装项目模板到项目目录
    installTemplate(selectedTemplate, options);
  }
}

export default function init(program) {
  return new InitCommand(program);
}
