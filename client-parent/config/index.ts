import type { UserConfig } from '@tarojs/cli';

const config: UserConfig = {
  projectName: 'study-agent-parent',
  date: '2026-03-30',
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
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
  },
};

export default (merge: (opts: Record<string, unknown>, presets: unknown[]) => Record<string, unknown>) => {
  return merge(config, []);
};