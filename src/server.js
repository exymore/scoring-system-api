import express from 'express';
import path from 'path';
import cors from 'cors';
import { dataForChart, recursiveClassifying, tree } from './ScoringSystem';
import initializeDbPostgres from './config/postgres';
import TrainData from './models/trainData';
import ReinforcementTrainData from './models/reinforcementTrainData';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
let data, decisionTree;

initializeDbPostgres(async () => {
  data = [
    ...(await TrainData.findAll({ raw: true })),
    ...(await ReinforcementTrainData.findAll({ raw: true }))
  ];
  console.log('Data for training is fetched');
  decisionTree = tree(data);
  console.log('Decision tree ready');
});

app.get('/', async function(req, res) {
  res.send(dataForChart(decisionTree));
});

app.post('/', async function(req, res) {
  const decision =
    recursiveClassifying(
      [
        req.body.married,
        req.body.dependents,
        req.body.education,
        req.body.selfEmployed,
        req.body.income,
        req.body.coapplicantIncome,
        req.body.amount,
        req.body.history
      ],
      decisionTree
    ) === 1;
  await ReinforcementTrainData.create({
    married: parseInt(req.body.married),
    dependents: parseInt(req.body.dependents),
    education: parseInt(req.body.education),
    self_employed: parseInt(req.body.selfEmployed),
    income: parseInt(req.body.income),
    coapplicantincome: parseInt(req.body.coapplicantIncome),
    amount: parseInt(req.body.amount),
    history: parseInt(req.body.history),
    loan_status: decision ? 1 : 0
  });
  res.send(decision);
});

app.listen(process.env.PORT || 3001, () => console.log('Server is running on port 3001'));
