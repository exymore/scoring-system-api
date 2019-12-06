import Sequelize from 'sequelize';

export default class TrainData extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        loan_id: { type: Sequelize.STRING, primaryKey: true },
        gender: { type: Sequelize.STRING },
        married: { type: Sequelize.STRING },
        dependents: { type: Sequelize.STRING },
        education: { type: Sequelize.STRING },
        self_employed: { type: Sequelize.STRING },
        income: { type: Sequelize.INTEGER },
        coapplicantincome: { type: Sequelize.INTEGER },
        amount: { type: Sequelize.INTEGER },
        term: { type: Sequelize.INTEGER },
        history: { type: Sequelize.INTEGER },
        property: { type: Sequelize.STRING },
        loan_status: { type: Sequelize.STRING }
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
