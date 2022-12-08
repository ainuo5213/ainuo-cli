import createInitCommand from "@ainuotestgroup/init-command";
import "./exception.js";

import createCli from "./cli.js";

export default function starter() {
  const program = createCli();
  createInitCommand(program);

  program.parse(process.argv);
}
