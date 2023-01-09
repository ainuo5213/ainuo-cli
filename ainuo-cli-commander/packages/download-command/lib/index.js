import Command from "@ainuotestgroup/command";
import {
  Github,
  makeList,
  Gitee,
  getGitPlatform,
  makeInput,
  PLATFORM_GITHUB,
  PLATFORM_GITEE,
  log,
} from "@ainuotestgroup/utils";

const GitPlatformList = [
  { name: PLATFORM_GITHUB, value: Github },
  { name: PLATFORM_GITEE, value: Gitee },
];

const NEXT_PAGE_VALUE = "${next_page}";
const NEXT_PAGE_NAME = "下一页";
const PREV_PAGE_VALUE = "$prev_page}";
const PREV_PAGE_NAME = "上一页";
const SEARCH_MODE_REPO = "search_repo";
const SEARCH_MODE_CODE = "search_code";

class DownloadCommand extends Command {
  gitAPI = null;
  q = "";
  language = "";
  page = 1;
  perPage = 10;
  totalCount = 0;
  choices = [];
  mode = SEARCH_MODE_REPO;
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

  async getSearchMode() {
    const searchMode = await makeList({
      message: "请选择搜索模式",
      choices: [
        { name: "源码", value: SEARCH_MODE_CODE },
        { name: "仓库", value: SEARCH_MODE_REPO },
      ],
    });

    return searchMode;
  }

  async searchGitAPI() {
    if (this.gitAPI.platform == PLATFORM_GITHUB) {
      this.mode = await this.getSearchMode();
    }
    const q = await makeInput({
      message: "请输入搜索关键字",
      validate(val) {
        return val.length > 0 ? true : "请输入搜索关键字";
      },
    });
    let language = "";
    if (this.gitAPI.platform === PLATFORM_GITEE) {
      language = await makeInput({
        message: "请输入开发语言",
      });
    }
    this.q = q;
    this.language = language;
    this.doSearch();
  }

  async doSearch() {
    let choices = [];
    let totalCount = 0;
    let res;
    if (this.mode === SEARCH_MODE_REPO) {
      res = await this.gitAPI.searchRepositories({
        keyWord: this.q,
        language: this.language,
        page: this.page,
        per_page: this.perPage,
      });
    } else {
      res = await this.gitAPI.searchSourceCode({
        keyWord: this.q,
        language: this.language,
        page: this.page,
        per_page: this.perPage,
      });
    }
    totalCount = res.totalCount;
    choices = res.items;
    this.totalCount = totalCount;
    if (this.totalCount > 0) {
      this.renderSearchResult(choices);
    } else {
      log.info("There was no data here!!!");
    }
  }

  async renderSearchResult(choices) {
    if (this.page * this.perPage < this.totalCount) {
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
      message: `请选择要下载的项目(共${this.totalCount}条数据)`,
      choices: this.choices,
      loop: false,
    });
    if (checkedReponsitory === NEXT_PAGE_VALUE) {
      this.nextPage();
    } else if (checkedReponsitory === PREV_PAGE_VALUE) {
      this.prevPage();
    } else {
      // TODO: 源码下载
      const selectResult = this.choices.find(
        (r) => r.value === checkedReponsitory
      )._data;
      this.downloadSourceCode(selectResult);
    }
  }

  downloadSourceCode(selectedReponsitory) {}

  prevPage() {
    this.page -= 1;
    this.doSearch();
  }

  nextPage() {
    this.page += 1;
    this.doSearch();
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
