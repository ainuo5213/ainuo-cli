import Command from "@ainuo-utils/command";
import {
  getGitPlatform,
  log,
  makeInput,
  makeList,
  PLATFORM_GITEE,
  PLATFORM_GITHUB,
  printErrorLog,
} from "@ainuo-utils/utils";
import ora from "ora";

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

  repoChoices = [];

  tagChoices = [];

  mode = SEARCH_MODE_REPO;

  tagPage = 1;

  tagTotalCount = 0;

  tagPerPage = 10;

  selectedRepository = null;

  selectedRepositoryTag = null;

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
    process.exit();
  }

  async generateGitAPI() {
    const platformInstance = await getGitPlatform()
    this.gitAPI = platformInstance;
  }

  async getSearchMode() {
    const searchMode = await makeList({
      message: "请选择搜索模式",
      choices: [
        {name: "源码", value: SEARCH_MODE_CODE},
        {name: "仓库", value: SEARCH_MODE_REPO},
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
    if (this.gitAPI.platform === PLATFORM_GITHUB) {
      language = await makeInput({
        message: "请输入开发语言",
      });
    }
    this.q = q;
    this.language = language;
    await this.getRepos();
  }

  async getRepos() {
    let repoChoices = [];
    let totalCount = 0;
    let res;
    const spinner = ora("fetching repos");
    try {
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
      spinner.stop();
    } catch (err) {
      printErrorLog(err);
      spinner.stop();
    }
    totalCount = res.totalCount;
    repoChoices = res.items;
    this.totalCount = totalCount;
    if (this.totalCount > 0) {
      await this.renderSearchedRepos(repoChoices);
    } else {
      log.info("There was no data here!!!");
    }
  }

  async renderSearchedRepos(repoChoices) {
    if (repoChoices.length === 0) {
      await this.renderSearchedRepos(this.repoChoices);
      return;
    }
    this.pageChoices(repoChoices, {
      page: this.page,
      perPage: this.perPage,
      totalCount: this.totalCount,
      canGenPageChoice: repoChoices.length > 0,
    });
    this.repoChoices.push(...repoChoices);
    await this.renderRepos(repoChoices);
  }

  async renderRepos(repoChoices) {
    if (repoChoices.length === 0) {
      return;
    }
    const checkedRepository = await makeList({
      message:
        "请选择要下载的项目" + this.gitAPI.platform === PLATFORM_GITHUB
          ? `(共${this.totalCount}条数据)`
          : "",
      choices: this.repoChoices,
      loop: false,
    });
    if (checkedRepository === NEXT_PAGE_VALUE) {
      this.nextRepos();
    } else if (checkedRepository === PREV_PAGE_VALUE) {
      this.prevRepos();
    } else {
      const selectResult = this.repoChoices.find(
        (r) => r.value === checkedRepository
      )._data;
      this.selectedRepository = selectResult;
      await this.getTags();
    }
  }

  pageChoices(choices, option) {
    option.canGenPageChoice =
      option.canGenPageChoice === undefined ? true : option.canGenPageChoice;
    if (!option.canGenPageChoice) {
      return;
    }
    if (option.page * option.perPage < option.totalCount) {
      choices.push({
        name: NEXT_PAGE_NAME,
        value: NEXT_PAGE_VALUE,
      });
    }
    if (option.page > 1) {
      choices.unshift({
        name: PREV_PAGE_NAME,
        value: PREV_PAGE_VALUE,
      });
    }
  }

  async getTags() {
    const spinner = ora(
      "fetching tags of " + this.selectedRepository.full_name
    );
    try {
      const {totalCount, items: tagChoices} =
        await this.gitAPI.getReleasedVersions({
          fullName: this.selectedRepository.full_name,
          perPage: this.tagPerPage,
          page: this.tagPage,
        });
      spinner.stop();
      if (this.tagPage === 1 && tagChoices.length === 0) {
        await this.downloadSourceCode();
        return;
      }
      this.tagTotalCount = totalCount;
      await this.renderSearchedTags(tagChoices);
    } catch (err) {
      printErrorLog(err);
      spinner.stop();
    }
  }

  async renderSearchedTags(tagChoices) {
    if (tagChoices.length === 0) {
      await this.renderTags(this.tagChoices);
      return;
    }
    this.pageChoices(tagChoices, {
      page: this.tagPage,
      totalCount: this.tagTotalCount,
      perPage: this.tagPerPage,
      canGenPageChoice:
        this.gitAPI.platform !== PLATFORM_GITEE && tagChoices.length > 0,
    });
    this.tagChoices.push(...tagChoices);
    await this.renderTags(tagChoices);
  }

  async renderTags(tagChoices) {
    if (tagChoices.length === 0) {
      return;
    }
    const checkedTag = await makeList({
      message: "请选择要下载项目的版本",
      choices: tagChoices,
      loop: false,
    });
    if (checkedTag === NEXT_PAGE_VALUE) {
      this.nextTags();
    } else if (checkedTag === PREV_PAGE_VALUE) {
      this.prevTags();
    } else {
      const selectResult = this.tagChoices.find(
        (r) => r.value === checkedTag
      )._data;
      this.selectedRepositoryTag = selectResult;
      await this.downloadSourceCode();
    }
  }

  async downloadSourceCode() {
    const repoUrl = this.gitAPI.getRepoUrl(this.selectedRepository.full_name);
    const spinner = ora(
      "downloading repo " + this.selectedRepository.full_name
    );
    spinner.start();
    try {
      await this.gitAPI.cloneRepo(repoUrl, this.selectedRepositoryTag?.name);
      spinner.stop();
      log.success("下载源码" + this.selectedRepository.full_name + "成功");
      this.installDependency();
    } catch (err) {
      printErrorLog(err);
      spinner.stop();
    }
  }

  installDependency() {
    const cwd = process.cwd();
    const fullName = this.selectedRepository.full_name;
    if (this.gitAPI.hasPkg(cwd, fullName)) {
      const spinner = ora("installing dependencies");
      spinner.start();
      try {
        this.gitAPI.installDependency(cwd, fullName);
        spinner.stop();
        log.success("dependencies were installed");
      } catch (err) {
        printErrorLog(err);
        spinner.stop();
      }
    }
  }

  async prevTags() {
    this.tagPage -= 1;
    await this.getTags();
  }

  async nextTags() {
    this.tagPage += 1;
    await this.getTags();
  }

  async prevRepos() {
    this.page -= 1;
    await this.getRepos();
  }

  async nextRepos() {
    this.page += 1;
    await this.getRepos();
  }
}

export default function Downloader(program) {
  return new DownloadCommand(program);
}
