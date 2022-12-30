const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
// const html = `<div>
//     <%_ if(username === 'ainuo5213') { -%>
//         <%_ -%><%= username -%>
//     <% } _%>
//    </div>`;
const options = {
  delimiter: "?",
};
const data = {
  username: "ainuo5213",
};
// const template = ejs.compile(html, options);
// const compiledTemplate = template(data);
// console.log(compiledTemplate);
// console.log(ejs.render(html, data, options));
let myFileLoader = function (filePath) {
  return "myFileLoader: " + fs.readFileSync(filePath);
};

ejs.fileLoader = myFileLoader;
const renderFileTemplatePromise = ejs.renderFile(
  path.join(__dirname, "./ejs/template.html"),
  data,
  options
);
renderFileTemplatePromise.then((data) => {
  console.log(data);
});
