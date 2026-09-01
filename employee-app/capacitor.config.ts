import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digitalhotel.employeeapp',
  appName: 'Employee App',
  webDir: '../frontend/dist',
  server: {
    cleartext: true
  }
};

export default config;
