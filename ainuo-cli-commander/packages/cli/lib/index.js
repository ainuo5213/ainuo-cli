import createInitCommand from "@ainuo-utils/init-command";
import createDownloadCommand from "@ainuo-utils/download-command";
import createLintCommand from "@ainuo-utils/lint-command";
import createCommitCommand from "@ainuo-utils/commit-command";
import "./exception.js";

import createCli from "./cli.js";

export default function starter() {
  const program = createCli();
  createInitCommand(program);
  createDownloadCommand(program);
  createLintCommand(program);
  createCommitCommand(program);
  program.parse(process.argv);
}
