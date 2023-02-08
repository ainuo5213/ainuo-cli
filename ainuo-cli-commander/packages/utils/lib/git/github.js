import axios from "axios";
import {PLATFORM_GITHUB} from "../cache.js";
import AbstractGit from "./AbstractGit.js";

const BASE_URL = "https://api.github.com";

export default class Github extends AbstractGit {
  platform = PLATFORM_GITHUB;

  initService() {
    const service = axios.create({
      baseURL: BASE_URL,
      timeout: 10 * 1000,
    });
    service.interceptors.request.use(
      (config) => {
        config.headers["Authorization"] = `Bearer ${this.token.trim()}`;
        config.headers["Accept"] = `application/vnd.github+json`;
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );
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
      params,
      method: "get",
      ...options,
    });
  }

  async searchRepositories(params) {
    const parameters = this.getSearchParams(params);
    const { total_count, items } = await this.get(
      "/search/repositories",
      parameters
    );
    return {
      totalCount: total_count,
      items: items.map((r) => {
        return {
          name: r.full_name + (r.description ? `(${r.description})` : ""),
          value: r.full_name,
          _data: r,
        };
      }),
    };
  }

  async searchSourceCode(params) {
    const parameters = this.getSearchParams(params);
    const { total_count, items } = await this.get("/search/code", parameters);
    return {
      totalCount: total_count,
      items: items.map((r) => {
        const repo = r.repository;
        return {
          name:
            repo.full_name + (repo.description ? `(${repo.description})` : ""),
          value: repo.full_name,
          _data: repo,
        };
      }),
    };
  }

  getSearchParams({ keyWord, language, page, per_page }) {
    return {
      q: `${keyWord}+language:${language}`,
      order: "desc",
      per_page: per_page || 5,
      page: page || 1,
    };
  }

  getReleasedVersions(params) {
    return this.get(`/repos/${params.fullName}/tags`, {
      per_page: params.perPage,
      page: params.page,
    }).then((data) => {
      return {
        totalCount: 999999,
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
    return `https://github.com/${fullName}.git`;
  }
}
