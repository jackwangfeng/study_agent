import { Component, PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import './styles/global.scss';

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('Parent App launched.');
  });

  return children;
}

export default App;