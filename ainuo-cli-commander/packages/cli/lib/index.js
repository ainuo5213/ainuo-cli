import createInitCommand from "@ainuotestgroup/init-command";
import createDownloadCommand from "@ainuotestgroup/download-command";
import createLintCommand from "@ainuotestgroup/lint-command";
import "./exception.js";

import createCli from "./cli.js";

export default function starter() {
  const program = createCli();
  createInitCommand(program);
  createDownloadCommand(program);
  createLintCommand(program);
  program.parse(process.argv);
}
