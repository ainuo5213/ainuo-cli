import { log, printErrorLog } from "@ainuotestgroup/utils";
import fse from "fs-extra";
import { pathExistsSync } from "path-exists";
import path from "node:path";
import ora from "ora";
import ejs from "ejs";
import glob from "glob";

function getCacheFilePath(targetPath, template) {
  return path.resolve(targetPath, "node_modules", template.npmName, "template");
}

function copyFile(targetPath, template, installDir) {
  const originFile = getCacheFilePath(targetPath, template);
  const spinner = ora("正在拷贝模板文件...").start();
  fse.copySync(originFile, installDir);
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
  ejsRender(installDir, template, name);
}

function ejsRender(installDir, template, name) {
  const ejsData = {
    data: {
      name: name,
    },
  };
  glob(
    "**",
    {
      cwd: installDir,
      nodir: true,
      ignore: ["**/node_modules/**", "**/public/**"].concat(
        template.ignore || []
      ),
    },
    (err, files) => {
      if (err) {
        printErrorLog(err);
      }
      ejsRenderFiles(files, installDir, ejsData);
    }
  );
}

function ejsRenderFiles(files, installDir, ejsData) {
  files.map((r) => {
    const filePath = path.join(installDir, r);
    ejsRenderFile(filePath, ejsData.data);
  });
}

function ejsRenderFile(filePath, data) {
  ejs.renderFile(
    filePath,
    {
      data,
    },
    (err, result) => {
      if (!err) {
        fse.writeFileSync(filePath, result);
      } else {
        printErrorLog(err);
      }
    }
  );
}
