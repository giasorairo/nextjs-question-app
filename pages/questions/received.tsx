import { useEffect, useState, useRef } from 'react';
import { Layout } from '../../components/Layout';
import { Question } from '../../model';
import { useAuthentication } from '../../hooks';
import firebase from 'firebase/app';
import dayjs from 'dayjs';
import Link from 'next/link';

export default function QuestionReceived() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const { user } = useAuthentication();
  const [isPaginationFinished, setIsPaginationFinished] = useState(false);
  const scrollContainerRef = useRef(null);

  // 質問を取得するクエリ
  const createBaseQuery = () => {
    if (!user?.uid) return;
    return firebase
      .firestore()
      .collection('questions')
      .where('receiverUid', '==', user.uid)
      // 降順
      .orderBy('createdAt', 'desc')
      .limit(10);
  };
  
  // 質問の追加処理
  const appendQuestions = (
    snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
  ) => {
    const gotQuestions = snapshot.docs.map((doc) => {
      const question = doc.data() as Question;
      question.id = doc.id;
      return question;
    });
    setQuestions([...questions, ...gotQuestions]);
  };

  /**
   * クエリを実行
   * データをstateに追加する処理を実行。
   */
  const loadQuestions = async () => {
    const snapshot = await createBaseQuery()?.get().catch((e) => console.log(e));
    if (snapshot === undefined || snapshot.empty) {
      setIsPaginationFinished(true);
      return;
    }
    appendQuestions(snapshot); 
  };

  const loadNextQuestions = async () => {
    if (questions.length === 0) return;
    const lastQuestion = questions[questions.length - 1];
    const snapshot = await createBaseQuery()
      ?.startAfter(lastQuestion.createdAt)
      .get()
      .catch((e) => console.log(e));
    
      if (snapshot === undefined || snapshot.empty) {
        setIsPaginationFinished(true);
        return;
      }
      appendQuestions(snapshot); 
  };

  // did mound 初期表示用の質問データ取得
  useEffect(() => {
    if (!process.browser) return;
    if (user === null) return;
    loadQuestions().catch((e) => console.log(e));
  }, [process.browser, user]);

  /**
   * スクロールイベント発火時の処理
   */
  const onScroll = () => {
    if (isPaginationFinished) {
      return;
    }
    const container: any = scrollContainerRef.current;
    if (container === null) {
      return;
    }
    // データが表示されているdivタグ部分の矩形を取得
    const rect = container.getBoundingClientRect();
    if (rect.top + rect.height > window.innerHeight) {
      return;
    }
    loadNextQuestions().catch((e) => console.log(e));;
  };

  // onScrollが更新される度にaddEventListenerしなおす
  useEffect(() => {
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [onScroll]);

  return (
    <Layout>
      {console.log('questions', questions)}
      <div>{questions.length}</div>
      <h1 className="h4"></h1>

      <div className="row justify-content-center">
        <div className="col-12 col-md-6" ref={scrollContainerRef}>
          {questions.map((question) => (
            <Link href="/questions/[id]" as={`/questions/${question.id}`} key={question.id}>
              <div className="card my-3">
                <div className="card-body">
                  <div className="text-truncate">{question.body}</div>
                  <div className="text-muted text-right">
                    <small>{dayjs(question.createdAt.toDate()).format('YYYY/MM/DD HH:mm')}</small>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};