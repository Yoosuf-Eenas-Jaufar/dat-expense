export default {
  expo: {
    name: 'Dat Expense',
    slug: 'dat-expense',
    version: '1.0.0',

    orientation: 'portrait',

    icon: './assets/icon.png',

    userInterfaceStyle: 'light',

    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    assetBundlePatterns: ['**/*'],

    android: {
      package: 'com.yoosuf.datexpense',

      permissions: [
        'android.permission.READ_SMS',
      ],

      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },

    platforms: ['android'],

    experiments: {
      typedRoutes: true,
    },
  },
};