'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add classId column
    await queryInterface.addColumn('students', 'classId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'classes',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });
    // Remove className column
    await queryInterface.removeColumn('students', 'className');
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse the migration
    await queryInterface.addColumn('students', 'className', {
      type: Sequelize.STRING(50),
      allowNull: true
    });
    await queryInterface.removeColumn('students', 'classId');
  }
};