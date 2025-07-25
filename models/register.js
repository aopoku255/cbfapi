'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Register extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Register.init({
    prefix: DataTypes.STRING,
    attendaceType: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    organization: DataTypes.STRING,
    suffix: DataTypes.STRING,
    continent: DataTypes.STRING,
    mobile_number: DataTypes.STRING,
    country: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    sector: DataTypes.STRING,
    position: DataTypes.STRING,
    gender: DataTypes.STRING,
    password: DataTypes.STRING,
    certificate: DataTypes.STRING,
    previousEvent: DataTypes.STRING,
    emailOptOut: DataTypes.STRING,
    photoRelease: DataTypes.STRING,
    category: DataTypes.STRING,
    paymentLink: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Register',
  });
  return Register;
};