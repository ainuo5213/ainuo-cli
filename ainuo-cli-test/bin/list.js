const inquirer = require("inquirer");

inquirer
  .prompt([
    {
      type: "editor",
      name: "favorites",
      message: "list you favorate food",
      choices: [
        {
          name: "apple",
          value: 1,
        },
        {
          name: "orange",
          value: 2,
        },
      ],
    },
    // {
    //   type: "input",
    //   name: "name",
    //   message: "Your name: ",
    // },
    // {
    //   type: "number",
    //   name: "age",
    //   message: "Your age: ",
    // },
    // {
    //   type: "confirm",
    //   name: "gender",
    //   message: "Your gender: ",
    // },
  ])
  .then((answer) => {
    console.log(answer);
    console.log(answer);
  });
