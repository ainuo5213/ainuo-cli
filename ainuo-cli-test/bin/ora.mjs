import ora, { oraPromise } from "ora";

(async function () {
  const p = (ora) => {
    console.log(ora.text);
    return new Promise((resolve, reject) => {
      console.log("do something");
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve();
        } else {
          reject();
        }
      }, 3000);
    });
  };
  await oraPromise(p, {
    failText: "失败了",
    successText: "成功了",
    prefixText: "Download ora",
    spinner: {
      interval: 80,
      frames: ["+", "-", "+"],
    },
  });
})();
