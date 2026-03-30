import type { UserConfig } from '@tarojs/cli';
import webpack from 'webpack';

const config: UserConfig = {
  projectName: 'study-agent',
  date: '2026-03-29',
  designWidth: 375,
  deviceRatio: {
    '640': 2.34 / 2,
    '750': 1,
    '828': 1.81 / 2,
    '375': 2 / 1,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'react',
  plugins: [
    '@tarojs/plugin-platform-weapp',
    '@tarojs/plugin-platform-h5',
    '@tarojs/plugin-framework-react',
  ],
  defineConstants: {
    'process.env.TARO_APP_API_URL': JSON.stringify('http://localhost:3000'),
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
  },
};

export default (merge: (opts: Record<string, unknown>, presets: unknown[]) => Record<string, unknown>) => {
  const finalConfig = merge(config, []);

  if (!finalConfig.h5) {
    finalConfig.h5 = {};
  }

  const originalOverride = (finalConfig.h5 as any).overrideWebpackChain;

  (finalConfig.h5 as any).overrideWebpackChain = (chain: any) => {
    if (originalOverride) {
      originalOverride(chain);
    }
    chain.plugin('define').use(webpack.DefinePlugin, [{
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      },
    }]);
    chain.devtool(false);
  };

  return finalConfig;
};