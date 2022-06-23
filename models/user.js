'use strict';
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';


const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Applicant)
      User.hasOne(models.Company)
      
    }
  }
  User.init({
    fullName: DataTypes.STRING,
    gender: DataTypes.STRING,
    email: DataTypes.STRING,
    skill: DataTypes.STRING,
    role: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate(instance) {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(instance.password, salt);
        instance.password = hash
        instance.fullName = "Name1"
        instance.gender = 'Male'
        instance.skill = "NodeJs"
        instance.createdAt = new Date()
        instance.updatedAt = new Date()
      }
    }
  });
  return User;
};