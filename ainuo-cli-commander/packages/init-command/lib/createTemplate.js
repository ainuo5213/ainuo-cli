import {
  getLatestVersion,
  log,
  makeInput,
  makeList,
} from "@ainuotestgroup/utils";
import { homedir } from "node:os";
import path from "node:path";
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

const TEMP_HOME_DIR = ".ainuo-cli";

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
    validate(value) {
      if (value.trim().length > 0) {
        return true;
      }
      return "输入项目名称";
    },
  });
}

function getProjectTemplate() {
  return makeList({
    message: "请选择项目模板",
    choices: AVALIABLE_TEMPLATES,
  });
}

function getTargetPath() {
  return path.resolve(`${homedir()}/${TEMP_HOME_DIR}`, "a-template");
}

export default async function createTemplate() {
  const templateType = await getTemplateType();
  if (templateType === TEMPLATE_TYPE_PROJECT) {
    const projectName = await getProjectName();
    const inputProjectTemplate = await getProjectTemplate();
    const selectedProjectTemplate = AVALIABLE_TEMPLATES.find(
      (r) => r.value === inputProjectTemplate
    );
    const latestVersion = await getLatestVersion(
      selectedProjectTemplate.npmName
    );
    selectedProjectTemplate.latestVersion = latestVersion;
    const targetPath = getTargetPath();
    return {
      type: templateType,
      name: projectName,
      template: selectedProjectTemplate,
      targetPath,
    };
  }
}
