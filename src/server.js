import express from 'express';
import path from 'path';
import cors from 'cors';
import { dataForChart } from './ScoringSystem';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.send(dataForChart);
});

app.listen(3001, () => console.log('Server is running on port 3001'));
