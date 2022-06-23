'use strict';
const { Op } = require("sequelize");

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Job.hasMany(models.Applicant)
      Job.belongsTo(models.Company)
    }

    static scopeNotVacantJob(options) {
      options.where = {...options.where, vacancy: {[Op.gt]: 0} }
      return Job.findAll(options)
    }

  }
  Job.init({
    title: DataTypes.STRING,
    vacancy: DataTypes.INTEGER,
    requirement: DataTypes.STRING,
    salary: DataTypes.INTEGER,
    CompanyId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Job',
  });
  return Job;
};