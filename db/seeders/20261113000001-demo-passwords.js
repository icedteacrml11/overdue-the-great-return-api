'use strict';

const password = require('../../src/security/password');

module.exports = {
  async up(queryInterface) {
    const hash = await password.hash('Aklat-Demo-2026');
    await queryInterface.bulkUpdate('users', { password_hash: hash }, { password_hash: null });
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate('users', { password_hash: null }, {});
  },
};

