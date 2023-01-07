import axios from "axios";
import AbstractGit from "./AbstractGit.js";

const BASE_URL = "https://api.github.com";

export default class Github extends AbstractGit {
  platform = "github";

  initService() {
    const serivce = axios.create({
      baseURL: BASE_URL,
      timeout: 10 * 1000,
    });
    serivce.interceptors.request.use(
      (config) => {
        config.headers["Authorization"] = `Bearer ${this.token}`;
        config.headers["Accept"] = `application/vnd.github+json`;
        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );
    serivce.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (err) => {
        return Promise.reject(err);
      }
    );
    return serivce;
  }

  get(url, params, ...options) {
    return this.serivce({
      url,
      params,
      method: "get",
      ...options,
    });
  }

  search(params) {
    return this.get("/search/repositories", params);
  }

  getSearchParams({ keyWord, language, page, per_page }) {
    return {
      q: `${keyWord}+language:${language}`,
      order: "desc",
      sort: "stars",
      per_page: per_page || 5,
      page: page || 1,
    };
  }
}
