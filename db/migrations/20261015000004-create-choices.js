module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('choices', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'questions', key: 'id' }, onDelete: 'CASCADE' },
      choice_text: { type: Sequelize.STRING(255), allowNull: false },
      position: { type: Sequelize.INTEGER, allowNull: false },
      is_correct: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    });
    await queryInterface.addConstraint('choices', {
      type: 'unique', name: 'uq_question_choice_position', fields: ['question_id', 'position'],
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('choices'); },
};
