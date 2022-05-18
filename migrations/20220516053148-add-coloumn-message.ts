"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("messages", "isBlocked", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("messages", "isBlocked");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
