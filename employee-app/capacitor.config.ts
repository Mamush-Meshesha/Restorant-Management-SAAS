import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hummyfly.employeeapp',
  appName: 'Employee App',
  webDir: '../frontend/dist',
  server: {
    cleartext: true
  }
};

export default config;
