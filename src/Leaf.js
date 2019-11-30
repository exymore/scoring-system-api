import { findEachCategory } from './ScoringSystem';

export default class Leaf {
  constructor(rows) {
    const obj = findEachCategory(rows);
    this.prediction = Object.keys(obj)[0];
  }
}
