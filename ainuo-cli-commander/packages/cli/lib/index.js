import createInitCommand from "@ainuo-utils/init-command";
import createDownloadCommand from "@ainuo-utils/clone-command";
import createLintCommand from "@ainuo-utils/lint-command";
import createCommitCommand from "@ainuo-utils/commit-command";
import createChatCommand from "@ainuo-utils/chat-command";
import "./exception.js";

import createCli from "./cli.js";

export default function starter() {
  const program = createCli();
  createInitCommand(program);
  createDownloadCommand(program);
  createLintCommand(program);
  createCommitCommand(program);
  createChatCommand(program)
  program.parse(process.argv);
}
