import { isNumeric, categories } from './ScoringSystem';

export default class Question {
  constructor(column, value) {
    this.column = column;
    this.value = value;
  }

  match(example) {
    const val = example[categories.indexOf(this.column)];
    if (isNumeric(val)) return val >= this.value;
    else return val === this.value;
  }

  toString() {
    let condition = '==';
    if (isNumeric(this.value)) condition = '>=';

    return `Is ${this.column} ${condition} ${this.value}?`;
  }
}
