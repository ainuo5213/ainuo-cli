import Command from "@ainuotestgroup/command";
import {
  clearCache,
  getGitLogin,
  getGitOwn,
  getGitPlatform,
  log,
  makeList,
  PLATFORM_GITEE,
  saveGitLogin,
  saveGitOwn,
} from "@ainuotestgroup/utils";
import ora from "ora";
import fse from 'fs-extra'
import path from 'node:path'
import SimpleGit from "simple-git";

const REPO_TYPE_USER = 'User'
const REPO_TYPE_ORGANIZATION = 'Organization'


class Index extends Command {
  gitAPI = null;

  gitOwn = null

  gitLogin = null

  simpleGit = null

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
    this.gitAPI = await getGitPlatform();
    const {gitOwn, gitLogin} = await this.getGitConfiguration()
    if (!gitOwn || !gitLogin) {
      throw new Error(`未查询到用户登录信息或组织信息！请添加'-c' 或 '--clear' 清除缓存后重试`)
    }
    this.gitOwn = gitOwn
    this.gitLogin = gitLogin
    const repo = await this.getRemoteRepository()
    await this.initLocalRepository(repo)
    process.exit();
  }

  async initLocalRepository(repo) {
    const remoteGitHttpUrl = repo.clone_url
    const cwd = process.cwd()
    const gitInitDirectoryPath = path.join(cwd, '.git')
    this.simpleGit = SimpleGit(cwd)
    if (!fse.existsSync(gitInitDirectoryPath)) {
      this.simpleGit.init()
    }
    const remotes = await this.simpleGit.getRemotes()
    const origin = remotes.find(r => r.name === 'origin')
    if (!origin) {
      this.simpleGit.addRemote('origin', remoteGitHttpUrl)
    }
    this.createGitIgnore()
    const masterBranch = this.gitAPI.platform === PLATFORM_GITEE ? 'master' : 'main'
    await this.simpleGit.pull('origin', 'master').catch(err => {
      if (err.message.indexOf(`couldn't find remote ref master`) >= 0) {
        log.error('拉取远程分支[' + masterBranch + ']失败')
      }
    })
  }

  createGitIgnore() {
    const cwd = process.cwd()
    const gitIgnorePath = path.join(cwd, '.gitignore')
    if (!fse.existsSync(gitIgnorePath)) {
      fse.writeFileSync(gitIgnorePath, `.DS_Store
node_modules
/dist


# local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
package-lock.json
yarn.lock`)
      log.success('gitignore文件创建成功')
    }
  }

  async getRemoteRepository() {
    const pkgName = this.getPackageName()
    let repo = await this.gitAPI.getRepository(this.gitLogin, pkgName)
    // 存在远程仓库，则建立关联；否则创建远程仓库之后建立关联
    if (!repo) {
      if (this.gitOwn === REPO_TYPE_USER) {
        repo = await this.gitAPI.createUserRepository(pkgName)
      } else {
        repo = await this.gitAPI.createOrganizationRepository(pkgName, gitLogin)
      }
    }
    return repo
  }

  getPackageName() {
    const cwd = process.cwd()
    const pkgPath = path.join(cwd, 'package.json')
    const pkgJson = fse.readJSONSync(pkgPath)
    return pkgJson.name
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
