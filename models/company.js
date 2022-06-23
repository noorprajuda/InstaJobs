'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Company.belongsTo(models.User)
      Company.hasMany(models.Applicant)
      Company.hasMany(models.Job)
    }
  }
  Company.init({
    name: DataTypes.STRING,
    UserId: DataTypes.INTEGER

  }, {
    sequelize,
    modelName: 'Company',
  });
  return Company;
};