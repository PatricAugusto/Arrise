module.exports = function (api) {
  const isProduction = api.env('production');
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      ...(isProduction
        ? [['@tamagui/babel-plugin', { components: ['tamagui'], config: './tamagui.config.ts' }]]
        : []),
      'react-native-worklets/plugin',
    ],
  };
};