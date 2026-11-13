'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const demoHash = await bcrypt.hash('Aklat-Demo-2026', 10);
    const [[existing]] = await queryInterface.sequelize.query(
      "SELECT user_id FROM users WHERE school_id = '2099-0099'"
    );
    if (existing) {
      await queryInterface.sequelize.query(
        "UPDATE users SET password_hash = :demoHash WHERE school_id = '2099-0099' AND password_hash IS NULL",
        { replacements: { demoHash } }
      );
      return;
    }

    await queryInterface.bulkInsert('users', [
      {
        school_id: '2099-0099',
        full_name: 'Ben Castro',
        email: 'ben.castro@overdue.test',
        role: 'HOST',
        password_hash: demoHash,
        created_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { school_id: '2099-0099' }, {});
  },
};
