'use strict';
module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define('Game', {
    currentPlayer: DataTypes.INTEGER,
    direction: DataTypes.BOOLEAN,
    color: DataTypes.STRING,
    players: DataTypes.INTEGER,
    drawable: DataTypes.INTEGER
  }, {});
  Game.associate = function(models) {
    // associations can be defined here
  };
  return Game;
};