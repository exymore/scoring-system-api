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

app.get('/data', async function(req, res) {
  try {
    res.send(dataForChart(decisionTree));
  } catch (err) {
    res.sendStatus(403);
  }
});

app.post('/data', async function(req, res) {
  try {
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
    res.send(decision);
  } catch (err) {
    res.sendStatus(400);
  }
});

app.listen(process.env.PORT || 3001, () => console.log('Server is running on port 3001'));
