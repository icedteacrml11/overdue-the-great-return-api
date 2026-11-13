module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'QuestionSet',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      host_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(100), allowNull: false },
      cover_url: { type: DataTypes.STRING(255), allowNull: true },
    },
    { tableName: 'question_sets', timestamps: true, createdAt: 'created_at', updatedAt: false }
  );