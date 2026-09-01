import fs from 'fs';
import path from 'path';

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getFiles(path.join(process.cwd(), 'src/views'));

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace <Grid item ...> back to <Grid ...> first just in case
  content = content.replace(/<Grid item /g, '<Grid ');

  // Replace xs={X} sm={Y} md={Z} lg={W} with size={{ xs: X, sm: Y, md: Z, lg: W }}
  content = content.replace(/<Grid\s+((?:(?:xs|sm|md|lg|xl)=\{\d+\}\s*)+)([^>]*)>/g, (match, sizesAttr, rest) => {
    const sizes = {};
    const regex = /(xs|sm|md|lg|xl)=\{(\d+)\}/g;
    let m;
    while ((m = regex.exec(sizesAttr)) !== null) {
      sizes[m[1]] = m[2];
    }
    
    // Construct size object string
    const sizeStr = Object.entries(sizes).map(([k, v]) => `${k}: ${v}`).join(', ');
    
    changed = true;
    return `<Grid size={{ ${sizeStr} }} ${rest}>`;
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
});
