import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tradingscanner.bow',
  appName: 'BoW Scanner',
  webDir: 'public',
  server: {
    // Ganti dengan URL domain aplikasi Anda di Vercel
    url: 'https://nama-proyek-anda.vercel.app',
    cleartext: false
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
