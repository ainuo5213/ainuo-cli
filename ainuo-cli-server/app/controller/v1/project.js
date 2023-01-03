const { Controller } = require('egg');

const AVALIABLE_TEMPLATES = [
  {
    name: 'vue3项目模板',
    npmName: '@ainuotestgroup/ainuo-template-vue3',
    version: '1.0.0',
    value: 'ainuo-template-vue3',
  },
  {
    name: 'react18项目模板',
    npmName: '@ainuotestgroup/ainuo-template-react18',
    version: '1.0.0',
    value: 'ainuo-template-react18',
  },
];

module.exports = class ProjectController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = AVALIABLE_TEMPLATES;
  }

  async create() {}

  update() {}

  destroy() {}

  show() {
    const { ctx } = this;
    const templateId = ctx.params.id;
    const template = AVALIABLE_TEMPLATES.find((r) => r.value === templateId);
    ctx.body = template || '';
  }
};
