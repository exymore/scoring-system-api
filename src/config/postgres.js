import { Sequelize } from 'sequelize';
import TrainData from '../models/trainData';
import ReinforcementTrainData from '../models/reinforcementTrainData';

export const sequelize = new Sequelize(process.env.POSTGRES_CONNECTION_URI, {
  logging: false,
  dialectOptions: {
    ssl: true
  }
});

export default async function initializeDbPostgres(callback) {
  try {
    await sequelize.authenticate();
    console.log('Postgre: Connection has been established successfully.');

    TrainData.init(sequelize);
    ReinforcementTrainData.init(sequelize);

    await sequelize.sync();
    return callback(sequelize);
  } catch (err) {
    console.log('Sequelize: Unable to connect to the database: ' + err.toString());
    process.exit(1);
  }
}
