'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if constraint exists before removing (safe in production)
    const [results] = await queryInterface.sequelize.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'student'::regclass
        AND conname = 'student_userId_tenantId_key';
    `);

    if (results.length > 0) {
      await queryInterface.removeConstraint('student', 'student_userId_tenantId_key');
      console.log('✅ Removed unique constraint student_userId_tenantId_key');
    } else {
      console.log('ℹ️ Constraint student_userId_tenantId_key not found — skipping removal');
    }
  },

  async down(queryInterface, Sequelize) {
    // Re-add the constraint if you ever roll back this migration
    await queryInterface.addConstraint('student', {
      fields: ['userId', 'tenantId'],
      type: 'unique',
      name: 'student_userId_tenantId_key',
    });
    console.log('🔁 Restored unique constraint student_userId_tenantId_key');
  },
};
