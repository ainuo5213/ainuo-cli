import createInitCommand from "@ainuotestgroup/init-command";
import createDownloadCommand from "@ainuotestgroup/download-command";
import "./exception.js";

import createCli from "./cli.js";

export default function starter() {
  const program = createCli();
  createInitCommand(program);
  createDownloadCommand(program);
  program.parse(process.argv);
}
