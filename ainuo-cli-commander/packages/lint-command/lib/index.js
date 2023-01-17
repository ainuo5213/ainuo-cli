import Command from "@ainuotestgroup/command";
import { ESLint } from "eslint";
import vueLint from "./eslint/vue.lint.js";

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

  async action(name, options) {
    // eslint校验
    const cwd = process.cwd();
    const eslinit = new ESLint({
      cwd: cwd,
      baseConfig: vueLint,
    });
    const result = await eslinit.lintFiles(["src/**/*.js", "src/**/*.vue"]);
    const formatter = await eslinit.loadFormatter("stylish");
    const resultText = formatter.format(result);
    const res = this.extractEslint(resultText);
    console.log(res);
    // 自动化测试
  }
}

export default function lint(program) {
  return new LintCommand(program);
}
