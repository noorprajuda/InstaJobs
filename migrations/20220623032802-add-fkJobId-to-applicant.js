'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     return queryInterface.addColumn('Applicants', 'JobId', {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
        model: {
          tableName: 'Jobs'
        }
      }
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     return queryInterface.removeColumn('Applicants', 'JobId')
  }
};
