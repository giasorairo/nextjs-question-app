import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User } from '../../model';
import firebase from 'firebase/app';
import { Layout } from '../../components/Layout';
import { toast } from 'react-toastify';

type Query = {
  uid: string,
};

export default function UserShow() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const query = router.query as Query;
  // 質問
  const [body, setBody] = useState('');
  // 連打防止フラグ
  const [isSending, setIsSending] = useState(false);

  /** ユーザ情報取得 */
  useEffect(() => {
    if (query.uid === undefined) return; 
    async function loadUser() {
      const doc = await firebase
        .firestore()
        .collection('users')
        .doc(query.uid)
        .get();

      if (!doc.exists) return;

      const gotUser = doc.data() as User;
      gotUser.uid = doc.id;
      setUser(gotUser);
    };
    loadUser().catch((e) => console.log(e));
  }, [query.uid]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!user?.uid) return;
    setIsSending(true);
    e.preventDefault();
    try {
      await firebase.firestore().collection('questions').add({
        // 操作しているユーザのid
        senderUid: firebase.auth().currentUser?.uid,
        // 質問ページの所有ユーザのid
        receiverUid: user.uid,
        body,
        isReplied: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      setIsSending(false);
  
      setBody('');
      toast.success('質問を送信しました。', {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } catch (e) {
      setIsSending(false);
      console.log(e);
      toast.warning('自分には送信できません。', {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  };

return (
  <Layout>
    {user && firebase.auth().currentUser && (
      <div className="container">
        {user && (
          <div className="text-center">
            <h1 className="h4">{user.name || ''}さんのページ</h1>
            <h1 className="m-5">{user.name || ''}さんに質問しよう！</h1>
          </div>
        )}
        <div className="row justify-content-center mb-3">
          <div className="col-12 col-md-6">
            <form onSubmit={onSubmit}>
              <textarea
                className="form-control"
                placeholder="おげんきですか？"
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              ></textarea>
              <div className="m-3">
                {isSending ? (
                  <div className="spinner-border text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <button type="submit" className="btn btn-primary">
                    質問を送信する
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
  </Layout>
  );
};