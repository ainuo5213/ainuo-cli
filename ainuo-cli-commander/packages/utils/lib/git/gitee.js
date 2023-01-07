import axios from "axios";
import AbstractGit from "./AbstractGit.js";

const BASE_URL = "https://gitee.com/api/v5";

export default class Gitee extends AbstractGit {
  platform = "gitee";

  initService() {
    const serivce = axios.create({
      baseURL: BASE_URL,
      timeout: 10 * 1000,
    });
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
      params: {
        ...params,
        access_token: this.token,
      },
      method: "get",
      ...options,
    });
  }

  search(params) {
    return this.get("/search/repositories", params);
  }

  getSearchParams({ keyWord, language, page, per_page }) {
    return {
      q: keyWord,
      language,
      order: "desc",
      sort: "stars_count",
      per_page: per_page || 5,
      page: page || 1,
    };
  }
}
