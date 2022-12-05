'use strict';

const initCommand = require('..');
const assert = require('assert').strict;

assert.strictEqual(initCommand(), 'Hello from initCommand');
console.info("initCommand tests passed");
