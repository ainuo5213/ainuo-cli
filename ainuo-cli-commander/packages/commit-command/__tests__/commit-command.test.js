'use strict';

const commitCommand = require('..');
const assert = require('assert').strict;

assert.strictEqual(commitCommand(), 'Hello from commitCommand');
console.info("commitCommand tests passed");
