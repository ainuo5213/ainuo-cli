"use strict";

const downloadCommand = require("../lib");
const assert = require("assert").strict;

assert.strictEqual(downloadCommand(), "Hello from downloadCommand");
console.info("downloadCommand tests passed");
