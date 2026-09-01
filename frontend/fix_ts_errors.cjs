const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    for (const { search, replace } of replacements) {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

replaceInFile('src/layouts/full/FullLayout.tsx', [
    { search: /import \{ motion, AnimatePresence \} from "framer-motion";\n/, replace: '' }
]);

replaceInFile('src/layouts/full/header/Profile.tsx', [
    { search: /\s+IconListCheck,/, replace: '' },
    { search: /currentUser\?\.avatar/g, replace: '(currentUser as any)?.avatar' }
]);

replaceInFile('src/layouts/full/sidebar/SidebarItems.tsx', [
    { search: /Typography, Badge/, replace: '' },
    { search: /IconChevronRight, /, replace: '' }
]);

replaceInFile('src/layouts/full/sidebar/SubscriptionWidget.tsx', [
    { search: /let alertIcon = null;/, replace: '' },
    { search: /statusBg/g, replace: 'theme.palette.background.paper' }
]);

replaceInFile('src/views/analytics/ExpensesPage.tsx', [
    { search: /import React, /, replace: 'import ' },
    { search: /IconReportMoney, /, replace: '' }
]);

replaceInFile('src/views/analytics/RevenuePage.tsx', [
    { search: /import React, /, replace: 'import ' },
    { search: /const \[loading, setLoading\] = useState\(true\);/, replace: 'const [, setLoading] = useState(true);' }
]);

replaceInFile('src/views/analytics/TransactionsPage.tsx', [
    { search: /import React, /, replace: 'import ' },
    { search: /o\.status === "COMPLETED"/g, replace: '(o.status as any) === "COMPLETED"' },
    { search: /o\.bills/g, replace: '(o as any).bills' }
]);

replaceInFile('src/views/customers/CustomersPage.tsx', [
    { search: /customer, onView/, replace: 'onView' },
    { search: /customer: any, onView/, replace: 'onView' }
]);

replaceInFile('src/views/customers/LoyaltyPage.tsx', [
    { search: /import React, /, replace: 'import ' },
    { search: /Avatar, /, replace: '' },
    { search: /IconPercentage, /, replace: '' }
]);

replaceInFile('src/views/dashboard/Dashboard.tsx', [
    { search: /import \{ useSmartPolling \} from "@\/hooks\/useSmartPolling";\n/, replace: '' }
]);

replaceInFile('src/views/inventory/InventoryPage.tsx', [
    { search: /category: "VEG"/, replace: 'category: "VEG" as any' },
    { search: /!createForm\.category/, replace: '!(createForm as any).category' },
    { search: /createForm\.category/g, replace: '(createForm as any).category' },
    { search: /category: e\.target\.value/, replace: 'category: e.target.value as any' }
]);

replaceInFile('src/views/menu/MenuItemsPage.tsx', [
    { search: /value=\{formData\.image_url\}/, replace: 'value={formData.image_url || ""}' }
]);

replaceInFile('src/views/messages/MessagesPage.tsx', [
    { search: /import React, /, replace: 'import ' },
    { search: /, ListItem/, replace: '' }
]);

replaceInFile('src/views/profile/ProfilePage.tsx', [
    { search: /import React, /, replace: 'import ' }
]);

replaceInFile('src/views/reservations/ReservationsPage.tsx', [
    { search: /import React, /, replace: 'import ' },
    { search: /IconUser, /, replace: '' },
    { search: /<Grid xs=\{selectedRes\.status === 'CANCELLED' \|\| selectedRes\.status === 'SEATED' \? 12 : 6\}>/, replace: '<Grid size={{ xs: selectedRes.status === \'CANCELLED\' || selectedRes.status === \'SEATED\' ? 12 : 6 }}>' }
]);

replaceInFile('src/views/settings/AppSettingsPage.tsx', [
    { search: /import \{ useState \} from "react";\n/, replace: '' },
    { search: /Button, /, replace: '' },
    { search: /IconBell, /, replace: '' },
    { search: /import \{ toast \} from "react-toastify";\n/, replace: '' }
]);

replaceInFile('src/views/settings/BillingSubscriptionPage.tsx', [
    { search: /p\.id/g, replace: '(p as any).id' },
    { search: /plan\.id/g, replace: '(plan as any).id' }
]);

replaceInFile('src/views/shared/PlaceholderPages.tsx', [
    { search: /import \{ getRevenueReport \} from "@\/api\/_analytics";\n/, replace: '' },
    { search: /import \{ getCustomers, createCustomer \} from "@\/api\/_customer";\n/, replace: '' },
    { search: /value: any, row: any/g, replace: '_: any, row: any' }
]);
