import fs from 'fs';
import path from 'path';

const files = [
  'src/views/menu/MenuItemsPage.tsx',
  'src/views/inventory/SuppliersPage.tsx',
  'src/views/inventory/InventoryPage.tsx',
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<Grid item /g, '<Grid ');
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
