import { homedir } from "node:os";
import path from "node:path";
import { TEMP_HOME_DIR, TEMP_TOKEN_DIR, TEMP_PLATFORM } from "../cache.js";
import { pathExistsSync } from "path-exists";
import fse from "fs-extra";
import { makePassword } from "../inquirer.js";

function getCachedTokenPath() {
  return path.join(homedir(), TEMP_HOME_DIR, TEMP_TOKEN_DIR);
}

function getCachedPlatformPath() {
  return path.join(homedir(), TEMP_HOME_DIR, TEMP_PLATFORM);
}

async function getToken() {
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

export function getPlatform() {
  const platformPath = getCachedPlatformPath();
  if (pathExistsSync(platformPath)) {
    return fse.readFileSync(platformPath).toString();
  }
  return "";
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
}
