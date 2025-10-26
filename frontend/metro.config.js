// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');
const { FileStore } = require('metro-cache');

const config = getDefaultConfig(__dirname);

// Use a stable on-disk store (shared across web/android)
const root = process.env.METRO_CACHE_ROOT || path.join(__dirname, '.metro-cache');
config.cacheStores = [
  new FileStore({ root: path.join(root, 'cache') }),
];

// Custom resolver to handle react-native-maps and native-only modules on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block react-native-maps entirely on web
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'web-stubs/react-native-maps.js'),
    };
  }
  
  // Block native-only codegenNativeComponent on web
  if (platform === 'web' && moduleName.includes('codegenNativeComponent')) {
    return { type: 'empty' };
  }
  
  // Block native-only codegenNativeCommands on web
  if (platform === 'web' && moduleName.includes('codegenNativeCommands')) {
    return { type: 'empty' };
  }
  
  // Block react-native-maps internal specs on web
  if (platform === 'web' && moduleName.includes('react-native-maps/src/specs')) {
    return { type: 'empty' };
  }
  
  // Default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

// Reduce the number of workers to decrease resource usage
config.maxWorkers = 2;

module.exports = config;
