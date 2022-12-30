import axios from "axios";

// let BASE_URL = "http://cli.ainuo5213.cn:7001";
let BASE_URL = "http://127.0.0.1:7001";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

function onSuccess(response) {
  return response.data;
}

function onRejected(error) {
  return Promise.reject(error);
}

axiosInstance.interceptors.response.use(onSuccess, onRejected);

export default axiosInstance;
