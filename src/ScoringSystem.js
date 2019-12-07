import Question from './Question';
import Branch from './Branch';
import Leaf from './Leaf';
import isEqual from 'lodash/isEqual';

export const categories = [
  'married',
  'dependents',
  'education',
  'self_employed',
  'income',
  'coapplicantincome',
  'amount',
  'history'
];

export const isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);

export const findEachCategory = rows => {
  const counts = {};
  for (const row of rows) {
    const label = row[row.length - 1];
    if (!(label in counts)) counts[label] = 0;
    counts[label] += 1;
  }
  return counts;
};

const isMatchesQuestion = (rows, question) => {
  const trueRows = [];
  const falseRows = [];
  for (const row of rows) {
    if (question.match(row)) trueRows.push(row);
    else falseRows.push(row);
  }
  return [trueRows, falseRows];
};

const impurityCheck = rows => {
  const counts = findEachCategory(rows);
  let impurity = 1;
  for (const label in counts) {
    const probability = counts[label] / rows.length;
    impurity -= probability ** 2;
  }
  return impurity;
};

const infoGainCheck = (left, right, uncertainty) => {
  const a = parseFloat(left.length) / (left.length + right.length);
  return uncertainty - a * impurityCheck(left) - (1 - a) * impurityCheck(right);
};

const findRelevantQuestion = rows => {
  let bestGain = 0;
  let bestQ = null;
  const uncertainty = impurityCheck(rows);
  const numberOfColumns = categories.length - 1;

  const values = new Set();
  for (let i = 0; i < numberOfColumns; i++) {
    for (const row of rows) {
      values.add(row[i]);
    }
    for (const value of values) {
      const question = new Question(categories[i], value);
      const [trueRows, falseRows] = [...isMatchesQuestion(rows, question)];
      if (trueRows.length === 0 || falseRows.length === 0) continue;
      const gain = infoGainCheck(trueRows, falseRows, uncertainty);

      if (gain >= bestGain) [bestGain, bestQ] = [gain, question];
    }
  }

  return [bestGain, bestQ];
};

export const recursiveClassifying = (row, node) => {
  if (node instanceof Leaf) return node.prediction;

  if (node.question.match(row)) return recursiveClassifying(row, node.trueBranch);
  else return recursiveClassifying(row, node.falseBranch);
};

const buildTree = rows => {
  const [gain, question] = findRelevantQuestion(rows);

  if (gain === 0) return new Leaf(rows);

  const [trueRows, falseRows] = isMatchesQuestion(rows, question);

  const trueBranch = buildTree(trueRows);
  const falseBranch = buildTree(falseRows);

  return new Branch(question, trueBranch, falseBranch);
};

const getTreeData = (node, treeRepresentation = {}, source) => {
  if (node instanceof Leaf) {
    return Object.assign(treeRepresentation, {
      name: node.prediction === 1 ? 'Resolve' : 'Reject'
    });
  }

  let children;
  const trueAnswer = getTreeData(node.trueBranch, treeRepresentation.children, true);
  const falseAnswer = getTreeData(node.falseBranch, treeRepresentation.children, false);

  if (
    (isEqual(trueAnswer, { name: 'Resolve' }) &&
      isEqual(falseAnswer, { name: 'Reject' })) ||
    (isEqual(trueAnswer, { name: 'Reject' }) && isEqual(falseAnswer, { name: 'Resolve' }))
  )
    children = [trueAnswer];
  else children = [trueAnswer, falseAnswer];

  return Object.assign(treeRepresentation, {
    name:
      source === undefined
        ? node.question.toString()
        : source
        ? `T: ${node.question.toString()}`
        : `F: ${node.question.toString()}`,
    children: children
  });
};

export const tree = data => buildTree(data.map(Object.values).map(el => el.slice(1)));
export const dataForChart = tree => getTreeData(tree);
