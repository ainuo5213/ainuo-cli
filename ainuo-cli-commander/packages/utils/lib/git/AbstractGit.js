import {homedir} from "node:os";
import path from "node:path";
import {TEMP_GIT_LOGIN, TEMP_GIT_OWN, TEMP_HOME_DIR, TEMP_PLATFORM, TEMP_TOKEN_DIR} from "../cache.js";
import {pathExistsSync} from "path-exists";
import fse from "fs-extra";
import {makePassword} from "../inquirer.js";
import {execaCommand} from "execa";
import {taobaoMirror} from "../npm.js";

function ensureHomeDir() {
  const homeDir = path.join(homedir(), TEMP_HOME_DIR)
  return fse.ensureDir(homeDir)
}

function getCachedConfiguration(getConfigurationFunction) {
  ensureHomeDir()
  return function (...args) {
    return getConfigurationFunction.call(this, ...args)
  }
}

export const getCachedTokenPath = getCachedConfiguration(() => path.join(homedir(), TEMP_HOME_DIR, TEMP_TOKEN_DIR))
export const getCachedPlatformPath = getCachedConfiguration(() => path.join(homedir(), TEMP_HOME_DIR, TEMP_PLATFORM))
export const getCachedGitLoginPath = getCachedConfiguration(() => path.join(homedir(), TEMP_HOME_DIR, TEMP_GIT_LOGIN))
export const getCachedGitOwnPath = getCachedConfiguration(() => path.join(homedir(), TEMP_HOME_DIR, TEMP_GIT_OWN))

export function clearCache() {
  const cachedTokenPath = path.join(homedir(), TEMP_HOME_DIR, TEMP_TOKEN_DIR);
  const cachedPlatformPath = path.join(homedir(), TEMP_HOME_DIR, TEMP_PLATFORM);
  const cachedGitLoginPath = path.join(homedir(), TEMP_HOME_DIR, TEMP_GIT_LOGIN);
  const cachedGitOwnPath = path.join(homedir(), TEMP_HOME_DIR, TEMP_GIT_OWN);
  fse.removeSync(cachedTokenPath)
  fse.removeSync(cachedPlatformPath)
  fse.removeSync(cachedGitLoginPath)
  fse.removeSync(cachedGitOwnPath)
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

  getUser() {
    throw new Error("method getUser must be implemented");
  }

  getOrg() {
    throw new Error("method getOrg must be implemented");
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
