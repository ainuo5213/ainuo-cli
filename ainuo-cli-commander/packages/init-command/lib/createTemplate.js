import { log, makeList } from "@ainuotestgroup/utils";
const AVALIABLE_TEMPLATES = [
  {
    name: "vue3项目模板",
    npmName: "@ainuotestgroup/ainuo-template-vue3",
    version: "1.0.0",
  },
  {
    name: "react18项目模板",
    npmName: "@ainuotestgroup/ainuo-template-react18",
    version: "1.0.0",
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

export default async function createTemplate(projectName, options) {
  const templateType = await getTemplateType();
  log.info(templateType);
}
