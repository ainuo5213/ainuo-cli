import { log } from "@ainuotestgroup/utils";
import fse from "fs-extra";
import { pathExistsSync } from "path-exists";
import path from "node:path";
import ora from "ora";

function getCacheFilePath(targetPath, template) {
  return path.resolve(targetPath, "node_modules", template.npmName, "template");
}

function copyFile(targetPath, template, installDir) {
  const originFile = getCacheFilePath(targetPath, template);
  const fileList = fse.readdirSync(originFile);
  const spinner = ora("正在拷贝模板文件...").start();
  fileList.forEach((r) => {
    fse.copyFileSync(`${originFile}/${r}`, `${installDir}/${r}`);
  });
  spinner.stop();
  log.success("模板拷贝成功！！！");
}

export default async function installTemplate(selectedTemplate, options) {
  const { force = false } = options;
  const { targetPath, name, template } = selectedTemplate;
  const rootDir = process.cwd();
  fse.ensureDirSync(targetPath);
  const installDir = path.resolve(`${rootDir}/${name}`);
  if (pathExistsSync(installDir)) {
    if (!force) {
      log.error(`当前目录下已存在 ${installDir} 文件夹`);
      return;
    } else {
      fse.removeSync(installDir);
      fse.ensureDirSync(installDir);
    }
  } else {
    fse.ensureDirSync(installDir);
  }

  copyFile(targetPath, template, installDir);
}
