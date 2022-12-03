function stepread(message, callback) {
  const input = process.stdin;
  const output = process.stdout;
  let line = "";
  // 先打印message
  output.write(message);
  // 派发keypress事件
  emitKeypressEvents(input);
  // keypress事件的处理
  function onkeypress(s) {
    output.write(s);
    line += s;
    switch (s) {
      case "\r":
        input.pause();
        // 换行
        output.write("\r\n");
        // 执行回调
        callback(line);
        break;
      default:
        break;
    }
  }
  input.on("keypress", onkeypress);

  // 设置原生模式，意味着需要开发者自己处理用户的字符输入
  input.setRawMode(true);
  input.resume();
}

function emitKeypressEvents(stream) {
  const g = emitKeys(stream);
  g.next(); // 调用函数执行到yield
  function onData(chunk) {
    // 再次调用无限循环到下一个yield，并传入输入的数据到该yield
    g.next(chunk.toString());
  }
  // 监听输入
  stream.on("data", onData);
}

function* emitKeys(stream) {
  // 无限循环，用于派发keypress事件
  while (true) {
    let ch = yield; // yield阻塞无限循环运行
    stream.emit("keypress", ch);
  }
}

stepread("请输入你的问题", (answer) => {
  console.log("answer: ", answer);
});
