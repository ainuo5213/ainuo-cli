'use strict';

const lintCommand = require('..');
const assert = require('assert').strict;

assert.strictEqual(lintCommand(), 'Hello from lintCommand');
console.info("lintCommand tests passed");
