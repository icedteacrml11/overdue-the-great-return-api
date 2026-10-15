module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('player_answers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      session_player_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'session_players', key: 'id' }, onDelete: 'CASCADE' },
      question_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'questions', key: 'id' }, onDelete: 'CASCADE' },
      choice_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'choices', key: 'id' }, onDelete: 'SET NULL' },
      is_correct: { type: Sequelize.BOOLEAN, allowNull: false },
      answered_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') },
    });
    await queryInterface.addConstraint('player_answers', {
      type: 'unique', name: 'uq_one_answer', fields: ['session_player_id', 'question_id'],
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('player_answers'); },
};
