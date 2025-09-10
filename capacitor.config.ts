import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.havenrealty.inspection',
  appName: 'Haven Realty Inspection',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2563eb',
      showSpinner: false
    },
    StatusBar: {
      style: 'light'
    }
  }
};

export default config;
