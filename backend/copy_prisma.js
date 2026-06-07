const fs = require('fs');
const path = require('path');

const runtimeDir = path.join(__dirname, 'node_modules', '@prisma', 'client', 'runtime');

// All known variants that prisma generate needs
const copies = [
  // wasm-base64 variants (used at runtime)
  ['query_compiler_bg.postgresql.wasm-base64.js',  'query_compiler_fast_bg.postgresql.wasm-base64.js'],
  ['query_compiler_bg.postgresql.wasm-base64.mjs', 'query_compiler_fast_bg.postgresql.wasm-base64.mjs'],
  // plain .js variant (required by prisma generate during the copy step)
  ['query_compiler_bg.postgresql.js',              'query_compiler_fast_bg.postgresql.js'],
];

let copied = 0;
for (const [src, dest] of copies) {
  const srcPath  = path.join(runtimeDir, src);
  const destPath = path.join(runtimeDir, dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${src} → ${dest}`);
    copied++;
  } else {
    console.warn(`Source not found (skipping): ${src}`);
  }
}

console.log(`\nDone. ${copied} file(s) copied.`);
