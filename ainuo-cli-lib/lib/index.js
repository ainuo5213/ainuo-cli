module.exports = {
  sum(a, b, c, d) {
    return a + b + c;
  },
  init({ name }) {
    console.log("init的参数name是", name);
  },
};
