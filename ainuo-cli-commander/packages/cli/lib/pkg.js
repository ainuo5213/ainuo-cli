import { resolve } from "node:path";
import { dirname } from "dirname-filename-esm";
import fse from "fs-extra";

const __dirname = dirname(import.meta);
const pkgPath = resolve(__dirname, "../package.json");
const json = fse.readFileSync(pkgPath, {
  encoding: "utf-8",
});

export default JSON.parse(json);
