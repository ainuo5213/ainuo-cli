const glob = require("glob");

glob(
  "**/*.js",
  {
    ignore: ["node_modules/**"],
  },
  (error, matches) => {
    if (error) {
      console.log(error.message);
      return error;
    }
    console.log(matches);
  }
);
