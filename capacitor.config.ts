import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nalanda.goldfinance',
  appName: 'Gold Finance',
  webDir: 'out',
  server: {
    url: 'https://studio--finapp-1fe29.asia-southeast1.hosted.app',
    cleartext: true
  }
};

export default config;
