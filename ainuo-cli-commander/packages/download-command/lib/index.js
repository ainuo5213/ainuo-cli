import Command from "@ainuotestgroup/command";
import {
  Github,
  makeList,
  Gitee,
  getGitPlatform,
  TEMP_PLATFORM,
} from "@ainuotestgroup/utils";

const GitPlatformList = [
  { name: "github", value: Github },
  { name: "gitee", value: Gitee },
];

class DownloadCommand extends Command {
  get command() {
    return "download";
  }

  get options() {
    return [];
  }

  get description() {
    return "download github source code";
  }

  async action(name, options) {
    const gitPlatform = getGitPlatform();
    const platformInstance = await this.getGitPlatformInstance(gitPlatform);
    await platformInstance.init();
    const data = await platformInstance.search({
      q: "vue+language:vue",
      order: "desc",
      sort: "stars",
      per_page: 5,
      page: 1,
    });
    console.log(data);
  }

  async getGitPlatformInstance(gitPlatform) {
    const platformItem = GitPlatformList.find((r) => r.name === gitPlatform);
    if (!platformItem) {
      return await this.getGitPlatform();
    } else {
      return new platformItem.value();
    }
  }

  async getGitPlatform() {
    const Platform = await makeList({
      message: "请选择Git平台",
      choices: GitPlatformList,
    });
    return new Platform();
  }
}

export default function Downloder(program) {
  return new DownloadCommand(program);
}
