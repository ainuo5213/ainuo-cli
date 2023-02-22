import {log, makeList, printErrorLog} from "@ainuo-utils/utils";
import fse from "fs-extra";
import {pathExistsSync} from "path-exists";
import path from "node:path";
import ora from "ora";
import ejs from "ejs";
import glob from "glob";

function getCacheFilePath(targetPath, template) {
  return path.resolve(targetPath, "node_modules", template.npmName, "template");
}

function getPluginFilePath(targetPath, template) {
  return path.resolve(targetPath, "node_modules", template.npmName, "plugins");
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
  ejsRender(targetPath, installDir, template, name);
}

async function ejsRender(targetPath, installDir, template, name) {
  const pluginPath = getPluginFilePath(targetPath, template);
  const pluginData = await loadPlugin(pluginPath);
  const ejsData = {
    data: {
      name: name,
      ...pluginData,
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

async function loadPlugin(pluginPath) {
  if (!pathExistsSync(pluginPath)) {
    return {};
  }
  const pkg = path.join(pluginPath, "package.json");
  if (!pathExistsSync(pkg)) {
    log.error("插件没有package.json文件");
    return {};
  }
  const pkgJson = JSON.parse(fse.readFileSync(pkg));
  const entry = path.join(pluginPath, pkgJson.main || "index.js");
  if (!pathExistsSync(entry)) {
    log.error("插件没有package.json的主入口(main)文件");
    return {};
  }
  const { default: loadPluginFn } = await import(entry);
  if (typeof loadPluginFn !== "function") {
    log.error("插件没有默认导出函数");
    return {};
  }
  const pluginData = await loadPluginFn({ makeList: makeList });
  return pluginData;
}
