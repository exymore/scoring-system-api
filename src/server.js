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
  data = await TrainData.findAll({ raw: true });
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
        req.body.gender,
        req.body.married,
        req.body.dependetnts,
        req.body.education,
        req.body.selfEmployed,
        Number(req.body.income),
        Number(req.body.coapplicantIncome),
        Number(req.body.amount),
        Number(req.body.term),
        Number(req.body.history),
        req.body.property
      ],
      decisionTree
    ) === 'Y';
  await ReinforcementTrainData.create(
    Object.assign(
      {
        gender: req.body.gender,
        married: req.body.married,
        dependents: req.body.dependents,
        education: req.body.education,
        selfEmployed: req.body.selfEmployed,
        income: Number(req.body.income),
        coapplicantIncome: Number(req.body.coapplicantIncome),
        amount: Number(req.body.amount),
        term: Number(req.body.term),
        history: Number(req.body.history),
        property: req.body.property
      },
      decision === false ? { loan_status: 'N' } : { loan_status: 'Y' }
    )
  );
  res.send(decision);
});

app.listen(process.env.PORT || 3001, () => console.log('Server is running on port 3001'));
