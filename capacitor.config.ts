import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.sereno.saludmental',
  appName: 'Sereno',
  webDir: 'dist',
  backgroundColor: '#f8f3e9',
  android: {
    backgroundColor: '#f8f3e9',
    allowMixedContent: false,
  },
  ios: {
    backgroundColor: '#f8f3e9',
    contentInset: 'always',
  },
}

export default config
