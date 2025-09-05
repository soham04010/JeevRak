module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@assets': './src/assets',
            '@modules': './src/modules',
            '@navigation': './src/navigation',
            '@store': './src/store',
            '@utils': './src/utils',
            '@components': './src/components',
            '@styles': './src/styles',
          },
        },
      ],
    ],
  };
};
