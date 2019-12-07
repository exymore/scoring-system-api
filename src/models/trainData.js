import Sequelize from 'sequelize';

export default class TrainData extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        loan_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          autoIncrementIdentity: true
        },
        married: { type: Sequelize.INTEGER },
        dependents: { type: Sequelize.INTEGER },
        education: { type: Sequelize.INTEGER },
        self_employed: { type: Sequelize.INTEGER },
        income: { type: Sequelize.INTEGER },
        coapplicantincome: { type: Sequelize.INTEGER },
        amount: { type: Sequelize.INTEGER },
        history: { type: Sequelize.INTEGER },
        loan_status: { type: Sequelize.INTEGER }
      },
      {
        sequelize,
        timestamps: false,
        tableName: 'train_data',
        schema: 'public'
      }
    );
  }
}
