import type { UserConfig } from '@tarojs/cli';

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
  plugins: [
    '@tarojs/plugin-platform-weapp',
    '@tarojs/plugin-framework-react',
  ],
  defineConstants: {},
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    webpackChainMap: {},
  },
  weapp: {
    webpackChainMap: {},
  },
};

export default function (merge: (opts: Record<string, unknown>, presets: unknown[]) => Record<string, unknown>) {
  return merge(config, {});
}
