'use strict';
module.exports = (sequelize, DataTypes) => {
  const Card = sequelize.define('Card', {
    color: DataTypes.STRING,
    value: DataTypes.STRING,
    special: DataTypes.BOOLEAN,
    possesion: DataTypes.STRING
  }, {});
  Card.associate = function(models) {
    // associations can be defined here
  };
  return Card;
};