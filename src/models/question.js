module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Question',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_set_id: { type: DataTypes.INTEGER, allowNull: false },
      question_type: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'MULTIPLE_CHOICE' },
      prompt_text: { type: DataTypes.TEXT, allowNull: false },
      position: { type: DataTypes.INTEGER, allowNull: false },
      time_limit_seconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 20 },
    },
    { tableName: 'questions', timestamps: false }
  );

