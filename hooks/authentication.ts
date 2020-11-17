import firebase from 'firebase';
import { User } from '../model';
import { atom, constSelector, useRecoilState } from 'recoil';
import { useEffect } from 'react';

const userState = atom<User | null>({
  key: 'user',
  default: null,
})

export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState);
  useEffect(() => {
    if (user !== null) return;
    firebase
      .auth()
      // 認証を開始
      .signInAnonymously()
      .catch((error) => {
        // handle error here
        console.log(error);
      });
    firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const loginUser: User = {
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
          name: '',
        };
        setUser(loginUser);
        createUserIfNotFound(loginUser)
          .catch((e) => console.log(e));
      } else {
        // user is signed out.
        setUser(null);
      }
    });
  }, []);
  return { user };
};

async function createUserIfNotFound(user: User) {
  const userRef = firebase.firestore().collection('users').doc(user.uid);
  try {
    const doc = await userRef.get();
    if (doc.exists) return; // 書き込みの方が高いため
    await userRef.set({
      name: 'taro' + new Date().getTime(),
    }); 
  } catch (e) {
    console.log(e);
  }
};