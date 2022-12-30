import {
  getLatestVersion,
  log,
  makeInput,
  makeList,
  printErrorLog,
  request,
} from "@ainuotestgroup/utils";
import { homedir } from "node:os";
import path from "node:path";
let AVALIABLE_TEMPLATES = [];
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

async function getTemplatesFromApi() {
  try {
    const data = await request({
      url: "/project/template",
      method: "get",
    });
    AVALIABLE_TEMPLATES = data;
  } catch (e) {
    printErrorLog(e);
    return null;
  }
}

export default async function createTemplate(name, options) {
  await getTemplatesFromApi();
  if (AVALIABLE_TEMPLATES.length === 0) {
    throw new Error("项目模板不存在");
  }
  const { type = null, template } = options;
  let templateType = type;
  if (!type) {
    templateType = await getTemplateType();
  }
  if (templateType === TEMPLATE_TYPE_PROJECT) {
    let projectName;
    if (name) {
      projectName = name;
    } else {
      projectName = await getProjectName();
    }
    let selectedProjectTemplate;
    if (template) {
      selectedProjectTemplate = AVALIABLE_TEMPLATES.find(
        (r) => r.value === template
      );
      if (!selectedProjectTemplate) {
        throw new Error("项目模板不存在");
      }
    } else {
      const inputProjectTemplate = await getProjectTemplate();
      selectedProjectTemplate = AVALIABLE_TEMPLATES.find(
        (r) => r.value === inputProjectTemplate
      );
    }
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
  } else if (templateType === TEMPLATE_TYPE_PAGE) {
  } else {
    throw new Error(`模板类型${templateType}不支持`);
  }
}
