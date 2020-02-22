import express from 'express';
import path from 'path';
import cors from 'cors';
import { dataForChart, recursiveClassifying, tree } from './src/ScoringSystem';
import initializeDbPostgres from './src/config/postgres';
import TrainData from './src/models/trainData';

const app = express();
const root = path.join(__dirname, 'client', 'build');

app.use(express.static(root));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
let data, decisionTree;

initializeDbPostgres(async () => {
  data = await TrainData.findAll({ raw: true });
  console.log('Data for training is fetched');
  decisionTree = tree(data);
  console.log('Decision tree ready');
});

const validator = async function(req, res, next) {
  const { income, amount, history, coapplicantIncome } = req.body;
  if (history === 0 || amount >= 1000 || (income <= 100 && coapplicantIncome <= 100))
    return res.send(false);
  else if (income >= 50000 || coapplicantIncome >= 50000 || amount <= 2)
    return res.send(true);
  return next();
};

app.get('/data', async function(req, res) {
  try {
    res.send(dataForChart(decisionTree));
  } catch (err) {
    res.sendStatus(403);
  }
});

app.post('/data', validator, async function(req, res) {
  try {
    const {
      income,
      amount,
      coapplicantIncome,
      education,
      dependents,
      selfEmployed,
      history,
      married
    } = req.body;
    const decision =
      recursiveClassifying(
        [
          married,
          dependents,
          education,
          selfEmployed,
          income,
          coapplicantIncome,
          amount,
          history
        ],
        decisionTree
      ) === 1;
    res.send(decision);
  } catch (err) {
    res.sendStatus(400);
  }
});

app.listen(process.env.PORT || 3001, () => console.log('Server is running on port 3001'));
