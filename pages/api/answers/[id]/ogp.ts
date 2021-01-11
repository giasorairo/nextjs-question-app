import { NextApiRequest, NextApiResponse } from 'next';
import '../../../../lib/firebase_admin';
import { firestore } from 'firebase-admin';
import { Answer } from '../../../../model/Answer';
import { Question } from '../../../../model/Question';

const { convert } = require('convert-svg-to-png');

export default async (req: NextApiRequest, res: NextApiResponse) => {

  const id = req.query.id as string;
  let text = '';

  try {
    const answerDoc = await firestore().collection('answers').doc(id).get();
    const answer = answerDoc.data() as Answer;
    const questionDoc = await firestore()
      .collection('questions')
      .doc(answer.questionId)
      .get();
    const question = questionDoc.data() as Question;
    console.log('question', question)
    text = question?.body || '';
  } catch (e) {
    console.log(e);
  }

  // ok
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 600 315" width="600" height="315" fill="white">
  <rect x="0" y="0" width="600" height="315" stroke="#ffffff" />
  <rect x="10" y="10" width="580" height="295" stroke="#6495ed" />
  <rect x="15" y="15" width="570" height="285" stroke="#6495ed" />
  <text x="200" y="50" font-family="serif" font-size="14" fill="black"> ${text}</text>
  <rect x="25" y="50" width="160" height="210" fill="#fff123" /></svg>`;
  // <text x="200" y="75" font-family="serif" font-size="14" fill="black">白の断章白の断章白の断章白の断章白の断章白${id}</text>
  // <text x="200" y="100" font-family="serif" font-size="14" fill="black">白の断章白の断章白の断章白の断章白の断章白${id}</text>
  // <text x="200" y="125" font-family="serif" font-size="14" fill="black">白の断章白の断章白の断章白の断章白の断章白${id}</text>
  // <text x="200" y="150" font-family="serif" font-size="14" fill="black">白の断章白の断章白の断章白の断章白の断章白${id}</text>
  // <text x="200" y="175" font-family="serif" font-size="14" fill="black">白の断章白の断章白の断章白の断章白の断章白${id}</text>
  // <text x="200" y="200" font-family="serif" font-size="14" fill="black">白の断章白の断章白の断章白の断章白の断章白${id}</text>
  // <text x="200" y="225" font-family="serif" font-size="14" fill="black">白の断章白の断章白の断章白の断章白の断章白${id}</text>
  // <text x="200" y="250" font-family="serif" font-size="14" fill="black">白の断章白の断章白の断章白の断章白の断章白${id}</text>
  // <text x="200" y="275" font-family="serif" font-size="14" fill="black">白の断章白の断章白の断章白の断章白の断章白${id}</text>
  // console.log('svg', svg)
  const pngBuffer = await convert(svg);
  // console.log('png', pngBuffer)
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': pngBuffer.length,
  })
  res.end(pngBuffer, 'binary');
};