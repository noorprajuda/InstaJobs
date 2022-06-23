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
    fullName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Full Name can not be empty!'
        }
      }

    },
    gender: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Gender can not be empty!'
        }
      }

    },
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'E-mail can not be empty!'
        },
        isEmail: {
          msg: 'Invalid e-mail address!'
        }
      }

    },
    skill: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Skill can not be empty!'
        }
      }

    },
    role: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Role can not be empty!'
        }
      }

    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Password can not be empty!'
        },
          min8(length) {
            if (length < 8) {
              throw new Error('Tidak perlu menggunakan prefix 0 di depan nomor telepon');
            }
          }
      }

    }
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
      },
      beforeUpdate(instance) {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(instance.password, salt);
        instance.password = hash
        instance.updatedAt = new Date()
      }
    }
  });
  return User;
};