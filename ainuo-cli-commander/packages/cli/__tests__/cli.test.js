import { execa } from "execa";
import path from "node:path";
const cliPath = path.join(__dirname, "../bin/cli.js");
const bin = (...args) => execa(cliPath, args);
test("run error command", async () => {
  const { stderr } = await bin("iii");
  expect(stderr).toContain("未知的命令: iii");
});

test("should not throw when use --help", async () => {
  let error = null;
  try {
    await bin("--help");
  } catch (err) {
    error = err;
  }
  expect(error).toBe(null);
});
