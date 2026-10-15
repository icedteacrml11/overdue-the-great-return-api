const { Op } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('session_players', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'sessions', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'user_id' }, onDelete: 'CASCADE' },
      nickname: { type: Sequelize.STRING(30), allowNull: false },
      score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      distance_progress: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      question_started_at: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addConstraint('session_players', {
      type: 'unique', name: 'uq_one_seat', fields: ['session_id', 'user_id'],
    });
    await queryInterface.addConstraint('session_players', {
      type: 'unique', name: 'uq_player_nickname', fields: ['session_id', 'nickname'],
    });
    await queryInterface.addConstraint('session_players', {
      type: 'check', name: 'ck_score_non_negative', fields: ['score'], where: { score: { [Op.gte]: 0 } },
    });
    await queryInterface.addConstraint('session_players', {
      type: 'check', name: 'ck_distance_progress_range', fields: ['distance_progress'], where: { distance_progress: { [Op.between]: [0, 10] } },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('session_players'); },
};
