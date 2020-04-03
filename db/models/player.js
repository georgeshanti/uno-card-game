'use strict';
module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
    name: DataTypes.STRING,
    position: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN,
    won: DataTypes.BOOLEAN,
    playerId: DataTypes.STRING
  }, {});
  Player.associate = function(models) {
    // associations can be defined here
  };
  return Player;
};