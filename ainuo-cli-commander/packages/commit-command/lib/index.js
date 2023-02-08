import Command from "@ainuotestgroup/command";
import {
  clearCache,
  getGitLogin,
  getGitOwn,
  getGitPlatform,
  makeList,
  saveGitLogin,
  saveGitOwn,
} from "@ainuotestgroup/utils";
import ora from "ora";

const REPO_TYPE_USER = 'User'
const REPO_TYPE_ORGANIZATION = 'Organization'

class Index extends Command {
  gitAPI = null;

  get command() {
    return "commit";
  }

  get options() {
    return [['-c --clear', '清除git缓存', false]];
  }

  get description() {
    return "commit code";
  }

  async action(args) {
    if (args.clear) {
      clearCache()
    }
    const platformInstance = await getGitPlatform()
    this.gitAPI = platformInstance;
    const {gitOwn, gitLogin} = await this.getGitConfiguration()
    if (!gitOwn || !gitLogin) {
      throw new Error(`未查询到用户登录信息或组织信息！请添加'-c或--clear'清除缓存后重试`)
    }
    process.exit();
  }

  async getGitConfiguration() {
    let gitOwn = getGitOwn()
    let gitLogin = getGitLogin()
    if (!gitLogin) {
      const spinner = ora('正在获取登录的用户信息')
      try {
        spinner.start()
        const [userInfo, organizations] = await Promise.all([this.gitAPI.getUser(), this.gitAPI.getOrg()])
        if (organizations.length > 1) {
          gitOwn = await this.getGitOwn()
          gitLogin = await this.getGitLogin()
        } else {
          gitOwn = REPO_TYPE_USER
          gitLogin = userInfo?.login
        }
        spinner.stop()
      } catch (e) {
        spinner.stop()
        throw new Error(e.message)
      }
    } else {
      const spinner = ora('正在获取用户的组织信息')
      try {
        spinner.start()
        const organizations = await this.gitAPI.getOrg()
        if (organizations.length > 1) {
          gitOwn = await this.getGitOwn()
        } else {
          gitOwn = REPO_TYPE_USER
        }
        spinner.stop()
      } catch (e) {
        spinner.stop()
        throw new Error(e.message)
      }
    }
    saveGitLogin(gitLogin)
    saveGitOwn(gitOwn)
    return {
      gitOwn, gitLogin
    }
  }

  async getGitLogin(organizations) {
    const orgList = organizations.map(r => {
      return {
        name: r.name || r.login, value: r.login
      }
    })
    let gitLogin = await makeList({
      message: '请选择组织名称', choices: orgList
    })
    return gitLogin
  }

  async getGitOwn() {
    let gitOwn = await makeList({
      message: '请选择仓库类型',
      choices: [{name: '个人', value: REPO_TYPE_USER}, {name: '组织', value: REPO_TYPE_ORGANIZATION},]
    })
    return gitOwn
  }
}

export default function Committer(program) {
  return new Index(program);
}
