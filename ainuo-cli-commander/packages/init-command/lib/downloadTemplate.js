import path from "node:path";
import {pathExistsSync} from "path-exists";
import fse from "fs-extra";
import ora from "ora";
import {printErrorLog} from "@ainuo-utils/utils";
import {execaCommand} from "execa";

function getCacheDir(targetPath) {
  return path.resolve(targetPath, "node_modules");
}

function createCacheDir(targetPath, template) {
  const cacheDir = getCacheDir(targetPath);
  if (!pathExistsSync(cacheDir)) {
    fse.mkdirsSync(cacheDir);
  } else if (template.version !== template.latestVersion) {
    fse.removeSync(cacheDir);
    fse.mkdirSync(cacheDir);
  }
}

async function execDownloadTemplate(selectedTemplate) {
  let {
    targetPath,
    template: { npmName, version, latestVersion },
  } = selectedTemplate;
  if (version !== latestVersion) {
    version = latestVersion;
  }
  const cwd = getCacheDir(targetPath);
  await execaCommand(
    `npm install ${npmName}@${version} --registry=${taobaoMirror}`,
    { cwd }
  );
}

export default async function downloadTemplate(selectedTemplate) {
  const { targetPath, template } = selectedTemplate;
  createCacheDir(targetPath, template);
  const spinner = ora("downloading template...").start();
  try {
    await execDownloadTemplate(selectedTemplate);
  } catch (err) {
    printErrorLog(err);
  } finally {
    spinner.stop();
  }
}
