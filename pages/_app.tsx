import { RecoilRoot } from 'recoil';
import '../styles/globals.scss';
import '../lib/firebase';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';

type MyAppProps = {
  Component: any,
  pageProps: any,
};

function MyApp(props: MyAppProps) {
  const { Component, pageProps } = props;
  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  )
}

export default MyApp
