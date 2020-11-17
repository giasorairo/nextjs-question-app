import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import firebase from 'firebase/app';
import { Layout } from '../../components/Layout';
import { Question, Answer } from '../../model';
import { useAuthentication } from '../../hooks';

type Query = {
  id: string,
};

export default function QuestionsShow() {
  const router = useRouter();
  const query = router.query as Query;
  const { user } = useAuthentication();
  const [question, setQuestion] = useState<Question | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [body, setBody] = useState('');
  const [answer, setAnswer] = useState<Answer | null>(null);

  const loadData = async () => {
    if (query.id === undefined) {
      return;
    }
    const questionDoc = await firebase.firestore()
      .collection('questions')
      .doc(query.id)
      .get();
    if (!questionDoc.exists) {
      return;
    }
    const gotQuestion = questionDoc.data() as Question;
    // id設定
    gotQuestion.id = questionDoc.id;
    setQuestion(gotQuestion);

    // // 回答取得
    if (!gotQuestion.isReplied) {
      return;
    }
    console.log('1')
    const answerSnapshot = await firebase.firestore()
      .collection('answers')
      .where('questionId', '==', gotQuestion.id)
      .limit(1)
      .get();
    console.log(answerSnapshot.empty)
    if (answerSnapshot.empty) {
      return;
    }

    // Answerのid設定
    const gotAnswer = answerSnapshot.docs[0].data() as Answer;
    gotAnswer.id = answerSnapshot.docs[0].id;
    setAnswer(gotAnswer);
  };

  useEffect(() => {
    // ログインしているかどうかのチェック
    console.log('user === null', user === null)
    if (user === null) {
      return;
    }
    loadData().catch((e) => console.log(e));
  }, [query.id, user]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!user || !question) {
      return;
    }
    e.preventDefault();
    setIsSending(true);

    await firebase.firestore().runTransaction(async (t) => {
      t.set(
        firebase.firestore().collection('answers').doc(),
        {
          uid: user.uid,
          questionId: question.id,
          body,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
      );
      t.update(
        firebase.firestore().collection('questions').doc(question.id),
        { isReplied: true },
      );
      setBody('')
      setIsSending(false);
      const now = new Date().getTime();
      setAnswer({
        id: '',
        uid: user.uid,
        questionId: question.id,
        body,
        createdAt: new firebase.firestore.Timestamp(now / 1000, now % 1000),
      });
    });
  };

  return(
    <Layout>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          {question && (
            <>
              <div className="card">
                <div className="card-body">{question.body}</div>
              </div>
              <section className="text-center mt-4">
                <h2 className="h4">回答</h2>

                {answer === null ? (
                  <form onSubmit={(e) => onSubmit(e)}>
                    <textarea
                      className="form-control"
                      placeholder="お元気ですか"
                      rows={6}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      required
                    >
                    </textarea>
                    <div className="m-3">
                      {isSending ? (
                        <div className="spinner-border text-secondary" role="status"></div>
                      ) : (
                        <button type="submit" className="btn btn-primary">
                          回答する
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="card">
                    <div className="card-body text-left">{answer.body}</div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};