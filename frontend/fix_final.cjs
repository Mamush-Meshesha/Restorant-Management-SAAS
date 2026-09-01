const fs = require('fs');

function replace(file, search, rep) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(search, rep);
  fs.writeFileSync(file, c);
}

// 1. SubscriptionWidget
replace('src/layouts/full/sidebar/SubscriptionWidget.tsx', /let alertIcon = null;/g, '');
replace('src/layouts/full/sidebar/SubscriptionWidget.tsx', /alertIcon = <IconAlertCircle size=\{16\} \/>;/g, '');
replace('src/layouts/full/sidebar/SubscriptionWidget.tsx', /alertIcon = <IconAlertTriangle size=\{16\} \/>;/g, '');
replace('src/layouts/full/sidebar/SubscriptionWidget.tsx', /statusBg/g, 'alpha(statusColor, 0.1)');

// 2. MessagesPage
replace('src/views/messages/MessagesPage.tsx', /ListItemAvatarText, /g, '');
replace('src/views/messages/MessagesPage.tsx', /<Grid item xs=\{2\}/g, '<Grid size={{ xs: 2 }}');

// 3. AppSettingsPage
replace('src/views/settings/AppSettingsPage.tsx', /ToggleButtonGroup, ToggleTooltip,/, 'ToggleButtonGroup, ToggleButton, Tooltip,');
replace('src/views/settings/AppSettingsPage.tsx', /<ToggleTooltip/g, '<Tooltip');
replace('src/views/settings/AppSettingsPage.tsx', /<\/ToggleTooltip>/g, '</Tooltip>');

console.log('Fixed final files');
