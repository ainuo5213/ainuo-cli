'use strict';

const chatCommand = require('..');
const assert = require('assert').strict;

assert.strictEqual(chatCommand(), 'Hello from chatCommand');
console.info("chatCommand tests passed");
