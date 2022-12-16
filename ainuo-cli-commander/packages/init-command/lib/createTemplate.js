import { log, makeInput, makeList } from "@ainuotestgroup/utils";
const AVALIABLE_TEMPLATES = [
  {
    name: "vue3项目模板",
    npmName: "@ainuotestgroup/ainuo-template-vue3",
    version: "1.0.0",
    value: "ainuo-template-vue3",
  },
  {
    name: "react18项目模板",
    npmName: "@ainuotestgroup/ainuo-template-react18",
    version: "1.0.0",
    value: "ainuo-template-react18",
  },
];
const TEMPLATE_TYPE_PROJECT = "project";
const TEMPLATE_TYPE_PAGE = "page";
const TEMPLATE_TYPES = [
  {
    name: "项目",
    value: TEMPLATE_TYPE_PROJECT,
  },
  {
    name: "页面",
    value: TEMPLATE_TYPE_PAGE,
  },
];

async function getTemplateType() {
  return makeList({
    choices: TEMPLATE_TYPES,
    message: "请选择初始化类型",
    defaultValue: TEMPLATE_TYPE_PROJECT,
  });
}

function getProjectName() {
  return makeInput({
    message: "请输入项目名称",
  });
}

function getProjectTemplate() {
  return makeList({
    message: "请选择项目模板",
    choices: AVALIABLE_TEMPLATES,
  });
}

export default async function createTemplate(name, options) {
  const templateType = await getTemplateType();
  if (templateType === TEMPLATE_TYPE_PROJECT) {
    const projectName = await getProjectName();
    const inputProjectTemplate = await getProjectTemplate();
    const selectedProjectTemplate = AVALIABLE_TEMPLATES.find(
      (r) => r.value === inputProjectTemplate
    );
    return {
      type: templateType,
      name: projectName,
      template: selectedProjectTemplate,
    };
  }
}
