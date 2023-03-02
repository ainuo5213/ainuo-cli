import path from "node:path";
import {homedir} from "node:os";
import {TEMP_HOME_DIR} from "./cache.js";
import fse from "fs-extra";

export function getCachedConfiguration(getConfigurationFunction) {
    ensureHomeDir()
    return function (...args) {
        return getConfigurationFunction.call(this, ...args)
    }
}

function ensureHomeDir() {
    const homeDir = path.join(homedir(), TEMP_HOME_DIR)
    return fse.ensureDir(homeDir)
}
