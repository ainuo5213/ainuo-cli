import Command from "@ainuotestgroup/command";
import createTemplate from "./createTemplate.js";
import downloadTemplate from "./downloadTemplate.js";
import installTemplate from "./installTemplate.js";

class InitCommand extends Command {
  get command() {
    return "init [name]";
  }

  get options() {
    return [
      ["-f, --force", "是否强制初始化", false],
      ["-t, --type <type>", "项目类型（project/page）"],
      ["-tp, --template <template>", "模板名称"],
    ];
  }

  get description() {
    return "初始化项目";
  }

  async action(name, options) {
    // 选择项目模板，生成项目信息
    const selectedTemplate = await createTemplate(name, options);
    // 下载模板到缓存目录
    await downloadTemplate(selectedTemplate);
    // 安装项目模板到项目目录
    await installTemplate(selectedTemplate, options);
  }
}

export default function init(program) {
  return new InitCommand(program);
}
