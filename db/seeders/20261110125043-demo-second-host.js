'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [
      {
        school_id: '2099-0099',
        full_name: 'Ben Castro',
        email: 'ben.castro@overdue.test',
        role: 'HOST',
        created_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { school_id: '2099-0099' }, {});
  },
};
