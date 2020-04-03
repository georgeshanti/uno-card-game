'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    // logic for transforming into the new state
    return queryInterface.addColumn(
      'Games',
      'drawable',
     Sequelize.INTEGER
    );

  },

  down: function(queryInterface, Sequelize) {
    // logic for reverting the changes
    return queryInterface.removeColumn(
      'Games',
      'drawable',
    );
  }
}
