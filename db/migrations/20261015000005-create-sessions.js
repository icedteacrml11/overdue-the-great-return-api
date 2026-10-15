module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      join_code: { type: Sequelize.CHAR(6), allowNull: false, unique: true },
      host_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'user_id' }, onDelete: 'CASCADE' },
      question_set_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'question_sets', key: 'id' }, onDelete: 'CASCADE' },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'LOBBY' },
      winner_player_id: { type: Sequelize.INTEGER, allowNull: true },
      started_at: { type: Sequelize.DATE, allowNull: true },
      ended_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });
    await queryInterface.addConstraint('sessions', {
      type: 'check', name: 'ck_sessions_status', fields: ['status'], where: { status: ['LOBBY', 'ACTIVE', 'FINISHED'] },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('sessions'); },
};
