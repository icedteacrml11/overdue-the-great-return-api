'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sessions', 'current_position', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('sessions', 'question_started_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.removeConstraint('sessions', 'ck_sessions_status');
    await queryInterface.addConstraint('sessions', {
      type: 'check',
      name: 'ck_sessions_status',
      fields: ['status'],
      where: { status: ['LOBBY', 'ACTIVE', 'RUNNING', 'FINISHED'] },
    });

    await queryInterface.addColumn('player_answers', 'points_awarded', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('player_answers', 'elapsed_ms', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('player_answers', 'elapsed_ms');
    await queryInterface.removeColumn('player_answers', 'points_awarded');
    await queryInterface.removeConstraint('sessions', 'ck_sessions_status');
    await queryInterface.addConstraint('sessions', {
      type: 'check',
      name: 'ck_sessions_status',
      fields: ['status'],
      where: { status: ['LOBBY', 'ACTIVE', 'FINISHED'] },
    });
    await queryInterface.removeColumn('sessions', 'question_started_at');
    await queryInterface.removeColumn('sessions', 'current_position');
  },
};

