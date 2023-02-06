import {pathExistsSync} from "path-exists";
import fse from "fs-extra";
import {makeList} from "../inquirer.js";
import {PLATFORM_GITEE, PLATFORM_GITHUB} from "../cache.js";
import { getCachedPlatformPath } from './AbstractGit.js'
import Github from "./github.js";
import Gitee from "./gitee.js";

const GitPlatformList = [
  { name: PLATFORM_GITHUB, value: Github },
  { name: PLATFORM_GITEE, value: Gitee },
];

function getPlatform() {
  const platformPath = getCachedPlatformPath();
  if (pathExistsSync(platformPath)) {
    return fse.readFileSync(platformPath).toString();
  }
  return "";
}

export async function getGitPlatform() {
  const gitPlatform = getPlatform()
  const platformItem = GitPlatformList.find((r) => r.name === gitPlatform);
  if (!platformItem) {
    const Platform = await makeList({
      message: "请选择Git平台",
      choices: GitPlatformList,
    });
    const platformInstance =  new Platform();
    await platformInstance.init()
    return platformInstance
  } else {
    const platformInstance =  new platformItem.value()
    await platformInstance.init()
    return platformInstance
  }
}