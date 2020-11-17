import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';

/**
 * Firebaseは基本的にブラウザ上で実行している時に利用する。
 * でもNext.jsはサーバでも実行されてしまうので、サーバで不要な読み込みを避けるためにwindowオブジェクトがあるかどうかで判断する
 * また状況によってこのファイルが何度かインポートされる場合があるので、既に初期化されている場合は何もしないようにしている。
 */
if (typeof window !== 'undefined' && firebase.apps.length === 0) {
  const firebaseConfig = {
    apiKey: "AIzaSyBGOaWfIqbmFOU9_4TrZ9z7gFmefdaKkVk",
    authDomain: "nextjs-question-app.firebaseapp.com",
    databaseURL: "https://nextjs-question-app.firebaseio.com",
    projectId: "nextjs-question-app",
    storageBucket: "nextjs-question-app.appspot.com",
    messagingSenderId: "352490443067",
    appId: "1:352490443067:web:142b5adf15544326a8671e",
    measurementId: "G-C5T0LYDBE5"
  };
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
}