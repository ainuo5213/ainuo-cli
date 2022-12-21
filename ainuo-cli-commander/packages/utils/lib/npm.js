import urlJoin from "url-join";
import axios from "axios";
import log from "./log.js";

async function getPackageInfo(packageName) {
  const registry = "https://registry.npmjs.org/";
  const url = urlJoin(registry, packageName);
  try {
    const { status, data } = await axios.get(url);
    if (status === 200) {
      return data;
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

export async function getLatestVersion(packageName) {
  const data = await getPackageInfo(packageName);
  if (!data["dist-tags"] || !data["dist-tags"]["latest"]) {
    const errorText = "cannot find latest version of " + packageName;
    log.error(errorText);
    return Promise.reject(new Error(errorText));
  } else {
    return data["dist-tags"]["latest"];
  }
}
