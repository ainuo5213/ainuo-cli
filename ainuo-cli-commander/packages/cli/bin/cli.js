#!/usr/bin/env node
const importLocal = require("import-local");
const log = require("npmlog");
const entry = require("../lib");

if (importLocal(__filename)) {
  log.info("acommander", "使用本地acommander版本");
} else {
  entry(process.argv.slice(2));
}
