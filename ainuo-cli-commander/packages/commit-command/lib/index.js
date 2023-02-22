import Command from "@ainuo-utils/command";
import {
  clearCache,
  getGitLogin,
  getGitOwn,
  getGitPlatform,
  log,
  makeInput,
  makeList,
  PLATFORM_GITEE,
  saveGitLogin,
  saveGitOwn,
} from "@ainuo-utils/utils";
import ora from "ora";
import fse from 'fs-extra'
import path from 'node:path'
import SimpleGit from "simple-git";
import semver from 'semver'

const REPO_TYPE_USER = 'User'
const REPO_TYPE_ORGANIZATION = 'Organization'


class Index extends Command {
  gitAPI = null;

  gitOwn = null

  gitLogin = null

  simpleGit = null

  version = null

  get mainBranch() {
    return this.gitAPI.platform === PLATFORM_GITEE ? 'master' : 'main'
  }

  get command() {
    return "commit";
  }

  get options() {
    return [['-c --clear', '清除git缓存', false], ['-p --publish', '发布分支代码', false]];
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
    // 阶段一：创建远程仓库
    const repo = await this.getRemoteRepository()

    // 阶段二：初始化本地仓库
    await this.initLocalRepository(repo)

    // 阶段三：代码自动化提交+版本号
    await this.commit(repo)

    // 阶段四：代码发布
    if (args.publish) {
      await this.publish()
    }
    process.exit(0);
  }

  async publish() {
    await this.checkTag()
    const masterBranch = this.mainBranch
    await this.checkoutBranch(masterBranch)
    await this.mergeBranchToMaster()
    await this.pushRemoteRepository(masterBranch)
    await this.deleteLocalBranch()
    await this.deleteRemoteBranch()
  }

  async deleteLocalBranch() {
    log.info(`开始删除本地分支 [${this.branch}]`)
    await this.simpleGit.deleteLocalBranch(this.branch)
    log.info(`删除本地分支成功 [${this.branch}]`)
  }

  async deleteRemoteBranch() {
    log.info(`开始删除远程分支 [${this.branch}]`)
    await this.simpleGit.push(['origin', '--delete', this.branch])
    log.info(`删除远程给分支成功 [${this.branch}]`)
  }

  async mergeBranchToMaster() {
    log.info(`开始合并代码 [${this.branch}] -> [${this.mainBranch}]`)
    await this.simpleGit.mergeFromTo(this.branch, 'master')
    log.success(`代码合并成功 [${this.branch} -> [${this.mainBranch}]]`)
  }

  async checkTag() {
    log.info('获取远程 tag 列表')
    const tag = `release/${this.version}`
    const tagList = await this.getRemoteVersionList('release')
    if (tagList.includes(this.version)) {
      log.info('远程 tag 已存在', tag)
      await this.simpleGit.push(['origin', `:refs/tags/${tag}`])
      log.success('远程 tag 已删除', tag)
    }
    const localTagList = await this.simpleGit.tags()
    if (localTagList.all.includes(tag)) {
      log.info('本地 tag 已存在', tag)
      await this.simpleGit.tag(['-d', tag])
      log.success('本地 tag 已删除', tag)
    }
    await this.simpleGit.addTag(tag)
    log.success('本地 tag 创建成功', tag)
    await this.simpleGit.pushTags('origin')
    log.success('远程 tag 推送成功', tag)
  }

  async commit(repo) {
    // 处理版本号
    await this.getCorrectVersion()

    // 处理stash区
    await this.checkStash()

    // 处理冲突
    await this.checkConflicted()

    // 处理提交
    await this.checkNotCommitted()

    // 切换分支
    await this.checkoutBranch(this.branch)

    // 拉取远程分支
    await this.pullRemoteMasterBranch()

    // 推送分支到远程分支
    await this.pushRemoteRepository(this.branch)
  }

  async pullRemoteMasterBranch() {
    const masterBranch = this.mainBranch
    log.info(`合并 [${masterBranch}] -> [${this.branch}]`)
    await this.pullRemoteBranch(masterBranch)
    log.success(`合并远程[${masterBranch}]成功`)
    log.info('检查远程分支')
    const remoteBranchList = await this.getRemoteVersionList('release')
    if (remoteBranchList.indexOf(this.version) >= 0) {
      log.info(`合并 [${this.branch}] -> [${this.branch}]`)
      await this.pullRemoteBranch(this.branch)
      log.success(`合并远程分支 [${this.branch}] 成功`)
      await this.checkConflicted()
    } else {
      log.success(`不存在远程分支 [${this.branch}]`)
    }
  }

  async pullRemoteBranch(remoteBranchName, option) {
    await this.simpleGit.pull('origin', remoteBranchName, option).catch(err => {
      log.error('拉取远程分支失败，失败原因', err.message)
      if (err.message.indexOf(`couldn't find remote ref master`) >= 0) {
        log.warn('拉取远程分支[' + remoteBranchName + ']失败')
      }
      process.exit(0)
    })
  }

  async checkoutBranch(branchName) {
    const localBranchList = await this.simpleGit.branchLocal()
    if (localBranchList.all.indexOf(branchName) >= 0) {
      await this.simpleGit.checkout(branchName)
    } else {
      await this.simpleGit.checkoutLocalBranch(branchName)
    }

    log.success(`本地分支切换到->${branchName}`)
  }

  async getCorrectVersion() {
    const remoteVersionList = await this.getRemoteVersionList('release')
    let releaseVersion
    if (remoteVersionList.length > 0) {
      releaseVersion = remoteVersionList[0]
    }
    let currentVersion = this.version
    if (!releaseVersion) {
      this.branch = `dev/${currentVersion}`
    } else if (semver.gt(currentVersion, releaseVersion)) {
      log.info(`当前版本号大于线上最新版本, ${currentVersion} > ${releaseVersion}`)
      this.branch = `dev/${currentVersion}`
    } else {
      log.info(`线上版本号大于当前版本号, ${releaseVersion} > ${currentVersion}`)
      const increaseVersionType = await makeList({
        message: '请选择升级的版本类型',
        defaultValue: 'patch',
        choices: [
          {name: `小版本（${releaseVersion} => ${semver.inc(releaseVersion, 'patch')}）`, value: 'patch'},
          {name: `中版本（${releaseVersion} => ${semver.inc(releaseVersion, 'minor')}）`, value: 'minor'},
          {name: `大版本（${releaseVersion} => ${semver.inc(releaseVersion, 'major')}）`, value: 'major'},
        ]
      })
      this.version = semver.inc(releaseVersion, increaseVersionType)
      this.branch = `dev/${this.version}`
      this.syncVersionToPackageJson()
    }
    log.success(`获取线上分支成功，${this.branch}`)
  }

  async checkStash() {
    log.info('检查 stash 记录')
    const stashList = await this.simpleGit.stashList()
    if (stashList.all.length > 0) {
      await this.simpleGit.stash(['pop'])
      log.success('stash pop 成功')
    }
  }

  async checkConflicted() {
    log.info('代码冲突检查')
    const status = await this.simpleGit.status()
    if (status.conflicted.length > 0) {
      throw new Error('当前代码存在冲突，请手动处理后再试')
    }
    log.success('代码冲突检查通过')
  }

  syncVersionToPackageJson() {
    const pkgJson = this.getPackageJson()
    if (pkgJson.version !== this.version) {
      pkgJson.version = this.version
      this.reWritePackageJson(pkgJson)
    }
  }

  reWritePackageJson(pkgJson) {
    const cwd = process.cwd()
    const pkgPath = path.join(cwd, 'package.json')
    fse.writeJSONSync(pkgPath, pkgJson, {spaces: 2})
  }

  async getRemoteVersionList(type) {
    const remoteList = await this.simpleGit.listRemote(['--refs'])
    let prefix = `refs/tags/${type}/`
    console.log(prefix)
    return remoteList.split('\n').map(r => {
      const index = r.indexOf(prefix)
      if (index > -1) {
        const version = r.slice(index + prefix.length)
        return semver.valid(version) ? version : ''
      }
      return ''
    }).filter(r => r).sort((a, b) => {
      if (semver.lte(b, a)) {
        return a === b ? 0 : -1
      }
      return 1
    })
  }

  async initLocalRepository(repo) {
    const remoteGitHttpUrl = repo.clone_url
    const cwd = process.cwd()
    const gitInitDirectoryPath = path.join(cwd, '.git')
    this.simpleGit = SimpleGit(cwd)
    if (!fse.existsSync(gitInitDirectoryPath)) {
      await this.simpleGit.init()
    }
    const remotes = await this.simpleGit.getRemotes()
    const origin = remotes.find(r => r.name === 'origin')
    if (!origin) {
      this.simpleGit.addRemote('origin', remoteGitHttpUrl)
    }
    this.createGitIgnore()
    const masterBranch = this.mainBranch
    const remoteBranches = await this.simpleGit.listRemote(['--refs'])
    // 存在远程main/master分支，拉取代码
    if (remoteBranches.indexOf('refs/heads/' + masterBranch) >= 0) {
      await this.pullRemoteBranch(masterBranch, {'--allow-unrelated-histories': null})
    } else {
      // 推送代码到远程main/master分支
      await this.pushRemoteRepository(masterBranch)
    }
  }

  async pushRemoteRepository(branchName) {
    log.info(`推送代码到远程分支->[${branchName}]`)
    await this.checkNotCommitted()
    await this.simpleGit.push('origin', branchName)
    log.success(`推送代码远程分支->${branchName}成功`)
  }

  async checkNotCommitted() {
    const status = await this.simpleGit.status()
    if (status.not_added.length > 0 || status.created.length > 0 || status.deleted.length > 0 || status.modified.length > 0 || status.renamed.length > 0) {
      await this.simpleGit.add(status.not_added)
      await this.simpleGit.add(status.created)
      await this.simpleGit.add(status.deleted)
      await this.simpleGit.add(status.modified)
      await this.simpleGit.add(status.renamed)
      let message = await makeInput({
        message: '请输入提交注释',
        validate(value) {
          return value.length > 0 ? true : "请输入提交注释";
        }
      })
      await this.simpleGit.commit(message)
      log.info('本地 commit 提交成功')
    } else {
      log.info('暂无提交内容')
    }
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
    const {name: pkgName, version} = this.getPackageJson()
    this.version = version || '1.0.0'
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

  getPackageJson() {
    const cwd = process.cwd()
    const pkgPath = path.join(cwd, 'package.json')
    const pkgJson = fse.readJSONSync(pkgPath)
    return pkgJson
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
