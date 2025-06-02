const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// 프로덕션 빌드 시 콘솔로그 제거 설정 추가
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    drop_console: true,
  },
};

module.exports = withNativeWind(config, { input: './global.css' });