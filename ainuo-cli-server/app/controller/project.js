'use strict';

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

class ProjectController extends Controller {
  async template() {
    const { ctx } = this;
    ctx.body = AVALIABLE_TEMPLATES;
  }
}

module.exports = ProjectController;
