const fs = require('fs');
const path = require('path');

const src1 = path.join(__dirname, 'node_modules', '@prisma', 'client', 'runtime', 'query_compiler_bg.postgresql.wasm-base64.js');
const dest1 = path.join(__dirname, 'node_modules', '@prisma', 'client', 'runtime', 'query_compiler_fast_bg.postgresql.wasm-base64.js');

const src2 = path.join(__dirname, 'node_modules', '@prisma', 'client', 'runtime', 'query_compiler_bg.postgresql.wasm-base64.mjs');
const dest2 = path.join(__dirname, 'node_modules', '@prisma', 'client', 'runtime', 'query_compiler_fast_bg.postgresql.wasm-base64.mjs');

try {
  fs.copyFileSync(src1, dest1);
  console.log('Copied js');
  fs.copyFileSync(src2, dest2);
  console.log('Copied mjs');
} catch (e) {
  console.error(e);
}
