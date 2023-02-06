import { homedir } from "node:os";
import path from "node:path";
import {TEMP_HOME_DIR, TEMP_TOKEN_DIR, TEMP_PLATFORM} from "../cache.js";
import { pathExistsSync } from "path-exists";
import fse from "fs-extra";
import {makePassword} from "../inquirer.js";
import { execaCommand } from "execa";
import { taobaoMirror } from "../npm.js";

function ensureHomeDir() {
  const homeDir = path.join(homedir(), TEMP_HOME_DIR)
  return fse.ensureDir(homeDir)
}

export function getCachedTokenPath() {
  ensureHomeDir()
  return path.join(homedir(), TEMP_HOME_DIR, TEMP_TOKEN_DIR);
}

export function getCachedPlatformPath() {
  ensureHomeDir()
  return path.join(homedir(), TEMP_HOME_DIR, TEMP_PLATFORM);
}

export async function getToken() {
  const tokenPath = getCachedTokenPath();
  if (pathExistsSync(tokenPath)) {
    return fse.readFileSync(tokenPath).toString();
  } else {
    const data = await makePassword({
      message: "请输入token信息",
    });
    fse.writeFileSync(tokenPath, data);
    return data;
  }
}

export function savePlatform(platform) {
  fse.writeFileSync(getCachedPlatformPath(), platform);
}

export default class AbstractGit {
  token = "";
  platform = "";
  service = null;
  async init() {
    this.token = await getToken();
    savePlatform(this.platform);
    this.serivce = this.initService();
  }

  initService() {
    throw new Error("method initService must be implemented");
  }

  searchRepositories() {
    throw new Error("method get must be implemented");
  }

  getSearchParams() {
    throw new Error("method getSearchParams must be implemented");
  }

  getReleasedVersions() {
    throw new Error("method getReleasedVersions must be implemented");
  }

  getRepoUrl() {
    throw new Error("getRepoUrl getReleasedVersions must be implemented");
  }

  cloneRepo(repoUrl, version) {
    const tagCommand = version ? ` -b ${version}` : "";
    return execaCommand(`git clone ${repoUrl}${tagCommand}`);
  }

  hasPkg(cwd, fullName) {
    const projectName = fullName.split("/")[1];
    const projectPath = path.resolve(cwd, projectName);
    const pkgPath = path.resolve(projectPath, "package.json");
    return pathExistsSync(projectPath) && pathExistsSync(pkgPath);
  }

  installDependency(cwd, fullName) {
    const projectName = fullName.split("/")[1];
    const projectPath = path.resolve(cwd, projectName);
    if (this.hasPkg(cwd, fullName)) {
      return execaCommand(`npm install --registry=${taobaoMirror}`, {
        cwd: projectPath,
      });
    }
  }
}
