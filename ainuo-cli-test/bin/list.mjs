import EventEmitter from "events";
import MuteStream from "mute-stream";
import readline from "readline";
import ansiEscapes from "ansi-escapes";
import { fromEvent } from "rxjs";
const option = {
  type: "list",
  name: "name",
  message: "Select Your Name",
  choices: [
    { name: "张三", value: "zhangsan" },
    { name: "李四", value: "lisi" },
    { name: "王麻子", value: "wangmazi" },
  ],
};
function prompt(option) {
  return new Promise((resolve, reject) => {
    try {
      const list = new List(option);
      list.render();
      list.on("exit", resolve);
    } catch (e) {
      reject(e);
    }
  });
}
class List extends EventEmitter {
  constructor(option) {
    super();
    this.name = option.name;
    this.message = option.message;
    this.choices = option.choices;
    this.input = process.stdin;
    const ms = new MuteStream(); // 静默流，用于在stdout之前做一些处理
    ms.pipe(process.stdout);
    this.output = ms;
    this.rl = readline.createInterface({
      input: this.input,
      output: this.output,
    });
    this.selectedIndex = 0;
    this.height = 0;
    // 监听keypress事件，rxjs会在回调处额外增加一些参数
    this.keypress = fromEvent(this.rl.input, "keypress").subscribe(
      this.onkeypress
    );
    this.haveSelected = false;
  }

  onkeypress = (keyMap) => {
    const keyName = keyMap[1].name;
    switch (keyName) {
      case "down":
        this.selectedIndex++;
        if (this.selectedIndex > this.choices.length - 1) {
          this.selectedIndex = 0;
        }
        this.render();
        break;
      case "up":
        this.selectedIndex--;
        if (this.selectedIndex < 0) {
          this.selectedIndex = this.choices.length - 1;
        }
        this.render();
        break;
      case "return":
        this.haveSelected = true;
        this.render();
        this.close();
        this.emit("exit", {
          [this.name]: this.choices[this.selectedIndex].value,
        });
        break;
      default:
        break;
    }
  };

  close() {
    this.output.unmute();
    this.rl.output.end();
    this.rl.pause();
    this.rl.close();
  }

  render() {
    // 解除用户的输入
    this.output.unmute();
    this.cleanScreen();
    this.output.write(this.content);

    // 限制用户输入
    this.output.mute();
  }

  cleanScreen() {
    const empty = ansiEscapes.eraseLines(this.height);
    process.stdout.write(empty);
  }

  get content() {
    if (!this.haveSelected) {
      // 使用ansic escape code 改变字体颜色、粗细等
      let title =
        "\x1B[32m?\x1B[39m \x1B[1m" +
        this.message +
        "\x1B[22m\x1B[0m \x1B[0m\x1B[2m(Use arrow keys)\x1B[22m\n";
      this.choices.forEach((choice, index) => {
        // 遍历的当前元素是被选中的那个
        if (index === this.selectedIndex) {
          if (index === this.choices.length - 1) {
            title += "\x1B[36m❯ " + choice.name + "\x1b[39m";
          } else {
            title += "\x1B[36m❯ " + choice.name + "\x1b[39m\n";
          }
        }
        // 遍历的当前元素没有被选中
        else {
          if (index === this.choices.length - 1) {
            title += "  " + choice.name;
          } else {
            title += "  " + choice.name + "\n";
          }
        }
      });
      this.height = this.choices.length + 1;
      return title;
    } else {
      const name = this.choices[this.selectedIndex].name;
      let title =
        "\x1B[32m?\x1B[39m \x1B[1m" +
        this.message +
        "\x1B[22m\x1B[0m \x1B[36m" +
        name +
        "\x1B[39m\x1B[0m\n";
      return title;
    }
  }
}

prompt(option).then((answer) => {
  console.log(answer);
});
