import plugins from "./index.js";
import { makeList } from "./inquirer.js";

plugins({ makeList: makeList }).then((data) => {
  console.log(data);
});
