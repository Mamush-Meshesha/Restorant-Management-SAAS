const fs = require('fs');

function replace(file, search, rep) {
  if (!fs.existsSync(file)) {
    console.log('File not found: ' + file);
    return;
  }
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(search, rep);
  fs.writeFileSync(file, c);
}

// 1. Header.tsx
replace('src/layouts/CustomerLayout/Header.tsx', /import \{ useEffect, useState, ReactNode \} from "react";/, 'import { useEffect, useState } from "react";');

// 2. AccountPage.tsx
replace('src/views/account/AccountPage.tsx', /Avatar, Tabs, Tab, Chip, LinearProgress, CardMedia, IconButton, CircularProgress,/, 'Avatar, Tabs, Tab, Chip, LinearProgress, CircularProgress,');
replace('src/views/account/AccountPage.tsx', /import \{ motion, AnimatePresence \} from "framer-motion";\n/, 'import { AnimatePresence } from "framer-motion";\n');
replace('src/views/account/AccountPage.tsx', /IconMapPin, IconHeartFilled, IconCoffee, IconDiamond/, 'IconCoffee, IconDiamond');
replace('src/views/account/AccountPage.tsx', /import \{ Link, useLocation \} from "react-router-dom";/, 'import { useLocation } from "react-router-dom";');
replace('src/views/account/AccountPage.tsx', /import \{ toggleFavoriteItem, toggleFavoriteLocation \} from "\.\.\/\.\.\/redux\/slices\/userSlice";\n/, '');
replace('src/views/account/AccountPage.tsx', /const dispatch = useAppDispatch\(\);\n/, '');
replace('src/views/account/AccountPage.tsx', /const \[menuItems, setMenuItems\] = useState<any\[\]>\(\[\]\);\n/, '');
replace('src/views/account/AccountPage.tsx', /const \[locations, setLocations\] = useState<any\[\]>\(\[\]\);\n/, '');
replace('src/views/account/AccountPage.tsx', /profile\?\.loyaltyHistory/g, '(profile as any)?.loyaltyHistory');
replace('src/views/account/AccountPage.tsx', /profile\.loyaltyHistory/g, '(profile as any).loyaltyHistory');

// 3. HomePage.tsx
replace('src/views/home/HomePage.tsx', /ease: "easeOut"/g, 'ease: "easeOut" as const');

// 4. TableSessionMenu.tsx
replace('src/views/public/TableSessionMenu.tsx', /Drawer, Badge, Stack, Fab, Divider, Grid/, 'Drawer, Badge, Stack, Fab, Grid');

console.log('Fixed customer-web errors');
