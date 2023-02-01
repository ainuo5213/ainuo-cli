import Command from "@ainuotestgroup/command";
import { ESLint } from "eslint";
import vueLint from "./eslint/vue.lint.js";
import reactLint from "./eslint/react.lint.js";
import normalLint from "./eslint/normal.lint.js";
import { execaCommandSync } from "execa";
import ora from "ora";
import { log, printErrorLog, taobaoMirror } from "@ainuotestgroup/utils";
import jest from "jest";
import path from "node:path";
import fse from "fs-extra";

const vueDependencyPackages = [
  "eslint-config-airbnb-base",
  "eslint-plugin-vue",
];

const reactDependencyPackages = ["eslint-plugin-react", "@babel/preset-react"];
const ProjectTypes = {
  React: "React",
  Vue: "Vue",
  Normal: "Normal",
};

const ProjectTypeLintScope = {
  [ProjectTypes.React]: ["src/**/*.{js|vue}"],
  [ProjectTypes.Vue]: ["src/**/*.{js|jsx}"],
  [ProjectTypes.Normal]: ["src/**/*.js"],
};
const ConfigLint = {
  [ProjectTypes.React]: vueLint,
  [ProjectTypes.Vue]: reactLint,
  [ProjectTypes.Normal]: normalLint,
};

const Dependencies = {
  [ProjectTypes.React]: vueDependencyPackages,
  [ProjectTypes.Vue]: reactDependencyPackages,
};

class LintCommand extends Command {
  get command() {
    return "lint";
  }

  get options() {
    return [];
  }

  get description() {
    return "eslint检查";
  }

  extractEslint(eslintText) {
    const problems = /(\d+) problems/;
    const errors = /(\d+) errors/;
    const warning = /(\d+) warning/;
    const problemMatch = eslintText.match(problems);
    const warningMatch = eslintText.match(warning);
    const errorMatch = eslintText.match(errors);
    let problemCount = problemMatch ? +problemMatch[1] : 0;
    let warningCount = warningMatch ? +warningMatch[1] : 0;
    let errorCount = errorMatch ? +errorMatch[1] : 0;
    return {
      problemCount,
      warningCount,
      errorCount,
    };
  }

  installPackages(cwd, projectType) {
    if (projectType === ProjectTypes.Normal) {
      return;
    }
    const spinner = ora("正在安装依赖...");
    try {
      spinner.start();
      const dependencies = Dependencies[projectType];
      execaCommandSync(
        `npm install ${dependencies.join(" ")} --registry=${taobaoMirror}`,
        {
          cwd,
        }
      );
      spinner.stop();
      log.success("安装依赖成功");
    } catch (err) {
      printErrorLog(err);
      spinner.stop();
    }
  }

  rewritePkgBabel(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    const pkg = JSON.parse(fse.readFileSync(pkgPath).toString());
    const presetEnv = "@babel/preset-env";
    const presetReact = "@babel/preset-react";
    if (pkg.babel === undefined) {
      pkg.babel = {
        presets: [
          presetReact,
          [
            presetEnv,
            {
              targets: {
                node: "current",
              },
            },
          ],
        ],
      };
    } else {
      pkg.babel.presets =
        pkg.babel.presets === undefined ? [] : pkg.babel.presets;
      const presets = pkg.babel.presets;
      const hasPresetReact = presets.find((r) =>
        Array.isArray(r) ? r[0] === presetReact : r === presetReact
      );
      const hasPresetEnv = presets.find((r) =>
        Array.isArray(r) ? r[0] === presetEnv : r === presetEnv
      );
      if (!hasPresetReact) {
        pkg.babel.presets.unshift(presetReact);
      }
      if (!hasPresetEnv) {
        pkg.babel.presets.push([
          presetEnv,
          {
            targets: {
              node: "current",
            },
          },
        ]);
      }
    }
    fse.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  }

  getProjectType(cwd) {
    const pkgPath = path.join(cwd, "package.json");
    const pkg = JSON.parse(fse.readFileSync(pkgPath).toString());
    const isReact = typeof pkg?.dependencies?.react === undefined;
    const isVue = typeof pkg?.dependencies?.vue === undefined;
    return isReact
      ? ProjectTypes.React
      : isVue
      ? ProjectTypes.Vue
      : ProjectTypes.Normal;
  }

  async action(name, options) {
    const cwd = process.cwd();
    const projectType = this.getProjectType(cwd);
    let baseConfigLint = ConfigLint[projectType];
    // 1. 安装依赖包

    this.installPackages(cwd, projectType);

    // 2. 执行eslint校验
    const eslinit = new ESLint({
      cwd: cwd,
      baseConfig: baseConfigLint,
    });
    if (projectType === ProjectTypes.React) {
      this.rewritePkgBabel(cwd);
    }

    const result = await eslinit.lintFiles(ProjectTypeLintScope[projectType]);
    const formatter = await eslinit.loadFormatter("stylish");
    const resultText = formatter.format(result);
    const res = this.extractEslint(resultText);

    log.success(
      "eslint检查完毕",
      "错误数量：" + res.errorCount,
      ", 警告数量：" + res.warningCount
    );
    // 自动化测试
    log.info("自动执行jest测试");
    await jest.run("test");
    log.success("jest自动测试执行完成");
  }
}

export default function lint(program) {
  return new LintCommand(program);
}
