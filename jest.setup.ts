import 'reflect-metadata';
const nodeCrypto = require('crypto');
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (arr) => nodeCrypto.randomBytes(arr.length)
  }
});
