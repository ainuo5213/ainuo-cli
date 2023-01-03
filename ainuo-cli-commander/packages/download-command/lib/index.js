import Command from "@ainuotestgroup/command";
import {
  Github,
  makeList,
  Gitee,
  TEMP_HOME_DIR,
  getGitPlatform,
  TEMP_PLATFORM,
} from "@ainuotestgroup/utils";
import { homedir } from "node:os";
import path from "node:path";
import fse from "fs-extra";
import {} from "path";

function getCachedPlatformPath() {
  return path.join(homedir(), TEMP_HOME_DIR, TEMP_PLATFORM);
}

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
