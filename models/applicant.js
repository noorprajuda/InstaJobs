'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Applicant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Applicant.belongsTo(models.User)
      Applicant.belongsTo(models.Job)
      Applicant.belongsTo(models.Company)
    }
  }
  Applicant.init({
    status: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    interviewDate: DataTypes.DATE,
    UserId: DataTypes.INTEGER,
    JobId: DataTypes.INTEGER,
    CompanyId: DataTypes.INTEGER

  }, {
    sequelize,
    modelName: 'Applicant',
  });
  return Applicant;
};