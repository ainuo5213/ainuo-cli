import Command from "@ainuotestgroup/command";
import ora from "ora";
import {
  Github,
  makeList,
  Gitee,
  getGitPlatform,
  TEMP_PLATFORM,
  makeInput,
} from "@ainuotestgroup/utils";

const GitPlatformList = [
  { name: "github", value: Github },
  { name: "gitee", value: Gitee },
];

const NEXT_PAGE_VALUE = "${next_page}";
const NEXT_PAGE_NAME = "下一页";
const PREV_PAGE_VALUE = "$prev_page}";
const PREV_PAGE_NAME = "上一页";

class DownloadCommand extends Command {
  gitAPI = null;
  q = "";
  language = "";
  page = 1;
  per_page = 10;
  total_count = 0;
  choices = [];
  get command() {
    return "download";
  }

  get options() {
    return [];
  }

  get description() {
    return "download github source code";
  }

  async action(name, options) {
    await this.generateGitAPI();
    await this.searchGitAPI();
  }

  async generateGitAPI() {
    const gitPlatform = getGitPlatform();
    const platformInstance = await this.getGitPlatformInstance(gitPlatform);
    await platformInstance.init();
    this.gitAPI = platformInstance;
  }

  async searchGitAPI() {
    // 收集搜索关键词和开发语言
    const q = await makeInput({
      message: "请输入搜索关键字",
      validate(val) {
        return val.length > 0 ? true : "请输入搜索关键字";
      },
    });
    const language = await makeInput({
      message: "请输入开发语言",
    });
    this.q = q;
    this.language = language;
    this.doSearch();
  }

  async doSearch() {
    const data = await this.searchReponsitories();
    // github
    this.total_count = data.total_count;
    const choices = data.items.map((r) => {
      return {
        name: `${r.full_name}(${r.description})`,
        value: r.full_name,
      };
    });
    if (this.page * this.per_page < this.total_count) {
      choices.push({
        name: NEXT_PAGE_NAME,
        value: NEXT_PAGE_VALUE,
      });
    }
    if (this.page > 1) {
      choices.unshift({
        name: PREV_PAGE_NAME,
        value: PREV_PAGE_VALUE,
      });
    }
    this.choices.push(...choices);
    const checkedReponsitory = await makeList({
      message: `请选择要下载的项目(共${this.total_count}条数据)`,
      choices: this.choices,
      loop: false,
    });
    if (checkedReponsitory === NEXT_PAGE_VALUE) {
      this.nextPage();
    } else if (checkedReponsitory === PREV_PAGE_VALUE) {
      this.prevPage();
    } else {
      // TODO: 源码下载
    }
  }

  prevPage() {
    this.page -= 1;
    this.doSearch();
  }

  nextPage() {
    this.page += 1;
    this.doSearch();
  }

  async searchReponsitories() {
    const searchParams = this.gitAPI.getSearchParams({
      keyWord: this.q,
      language: this.language,
      page: this.page,
      per_page: this.per_page,
    });
    const data = await this.gitAPI.search(searchParams);
    return data;
  }

  async getGitPlatformInstance(gitPlatform) {
    const platformItem = GitPlatformList.find((r) => r.name === gitPlatform);
    if (!platformItem) {
      return await this.getGitPlatform();
    } else {
      return new platformItem.value();
    }
  }

  async getGitPlatform() {
    const Platform = await makeList({
      message: "请选择Git平台",
      choices: GitPlatformList,
    });
    return new Platform();
  }
}

export default function Downloder(program) {
  return new DownloadCommand(program);
}
