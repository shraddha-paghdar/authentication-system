const { Sequelize } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
      allowNull: false,
      primaryKey: true,
      isLowercase: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    countryCode: {
      type: DataTypes.STRING,
    },
    phoneNumber: {
      type: DataTypes.STRING,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      default: false,
    },
  }, {
    defaultScope: {
      attributes: {
        exclude: [
          'uuid',
          'password',
        ],
      },
    },
    paranoid: true,
    indexes: [],
  })

  User.associate = function (models) {
  }
  return User
}
