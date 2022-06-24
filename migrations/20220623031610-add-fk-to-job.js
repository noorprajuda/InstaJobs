'use strict';

module.exports = {
  up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     return queryInterface.addColumn('Jobs', 'CompanyId', {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
        model: {
          tableName: 'Companies'
        }
      }
    })
  },

  down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     return queryInterface.removeColumn('Jobs', 'CompanyId')
  }
};
