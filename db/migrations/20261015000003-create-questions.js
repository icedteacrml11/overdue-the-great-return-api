module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('questions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      question_set_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'question_sets', key: 'id' }, onDelete: 'CASCADE' },
      question_type: { type: Sequelize.STRING(20), allowNull: false },
      prompt_text: { type: Sequelize.TEXT, allowNull: false },
      position: { type: Sequelize.INTEGER, allowNull: false },
      time_limit_seconds: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 20 },
    });
    await queryInterface.addConstraint('questions', {
      type: 'unique', name: 'uq_question_set_position', fields: ['question_set_id', 'position'],
    });
    await queryInterface.addConstraint('questions', {
      type: 'check', name: 'ck_questions_type', fields: ['question_type'], where: { question_type: ['MULTIPLE_CHOICE', 'TRUE_FALSE'] },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('questions'); },
};
