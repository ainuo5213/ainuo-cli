import axios from "axios";
import {PLATFORM_GITEE} from "../cache.js";
import AbstractGit from "./AbstractGit.js";

const BASE_URL = "https://gitee.com/api/v5";

export default class Gitee extends AbstractGit {
  platform = PLATFORM_GITEE;
  initService() {
    const service = axios.create({
      baseURL: BASE_URL,
      timeout: 10 * 1000,
    });
    service.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (err) => {
        return Promise.reject(err);
      }
    );
    return service;
  }

  get(url, params, ...options) {
    return this.serivce({
      url,
      params: {
        ...params,
        access_token: this.token,
      },
      method: "get",
      ...options,
    });
  }

  async searchRepositories(params) {
    const parameters = this.getSearchParams(params);
    const data = await this.get("/search/repositories", parameters);
    return {
      totalCount: 999999,
      items: data.map((r) => {
        return {
          name: r.full_name + (r.description ? `(${r.description})` : ""),
          value: r.full_name,
          _data: r,
        };
      }),
    };
  }

  getSearchParams({ keyWord, language, page, per_page }) {
    const params = {
      q: keyWord,
      order: "desc",
      per_page: per_page || 5,
      page: page || 1,
    };

    if (language) {
      params.language = language;
    }

    return params;
  }

  getReleasedVersions(params) {
    return this.get(`/repos/${params.fullName}/tags`).then((data) => {
      return {
        totalCount: data.length,
        items: data.map((r) => ({
          name: r.name,
          value: r.name,
          _data: r,
        })),
      };
    });
  }

  getUser() {
    return this.get('/user')
  }

  getOrg() {
    return this.get('/user/orgs')
  }

  getRepoUrl(fullName) {
    return `https://gitee.com/${fullName}.git`;
  }

  post(url, data, ...options) {
    return this.serivce({
      url,
      data: {
        access_token: this.token,
        ...data
      },
      method: "post",
      ...options,
    });
  }

  createUserRepository(repositoryName) {
    return this.post('/user/repos', {
      name: repositoryName
    })
  }

  createOrganizationRepository(repositoryName, orgName) {
    return this.post(`/orgs/${org}/repos`, {
      name: repositoryName
    })
  }

  getRepository(own, repoName) {
    return this.get(`/repos/${own}/${repoName}`).then(r => {
      r.clone_url = r.html_url
      return r
    }).catch(r => {
      if (r.response.status === 404) return null
      throw new Error(r)
    })
  }
}
