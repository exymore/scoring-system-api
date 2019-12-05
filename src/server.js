import express from 'express';
import path from 'path';
import cors from 'cors';
import { dataForChart, recursiveClassifying, tree } from './ScoringSystem';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.send(dataForChart);
});

app.post('/', function(req, res) {
  console.log(req.body);
  const {
    dependetnts,
    coapplicantIncome,
    property,
    gender,
    education,
    amount,
    history,
    selfEmployed,
    income,
    term,
    married
  } = req.body;
  const decision =
    recursiveClassifying(
      [
        gender,
        married,
        dependetnts,
        education,
        selfEmployed,
        Number(income),
        Number(coapplicantIncome),
        Number(amount),
        Number(term),
        Number(history),
        property
      ],
      tree
    ) === 'Y';
  res.send(decision);
});

app.listen(3001, () => console.log('Server is running on port 3001'));
