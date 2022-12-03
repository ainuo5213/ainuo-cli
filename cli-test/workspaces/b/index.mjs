import ora from "ora";

export function startLoading() {
  const spinner = ora().start("loading");

  setTimeout(() => {
    spinner.stop();
  }, 5000);
}
