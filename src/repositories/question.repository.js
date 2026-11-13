const { sequelize, Question, Choice } = require('../models');

function findAllBySetId(questionSetId) {
  return Question.findAll({
    where: { question_set_id: questionSetId },
    include: [{ model: Choice, as: 'choices' }],
    order: [
      ['position', 'ASC'],
      [{ model: Choice, as: 'choices' }, 'position', 'ASC'],
    ],
  });
}

function findById(id, options = {}) {
  return Question.findByPk(id, {
    include: [{ model: Choice, as: 'choices' }],
    order: [[{ model: Choice, as: 'choices' }, 'position', 'ASC']],
    ...options,
  });
}

async function nextPosition(questionSetId, transaction) {
  const max = await Question.max('position', {
    where: { question_set_id: questionSetId },
    transaction,
  });
  return (Number(max) || 0) + 1;
}

async function createWithChoices(questionSetId, questionData, choicesData) {
  return sequelize.transaction(async (t) => {
    const position = await nextPosition(questionSetId, t);
    const question = await Question.create(
      {
        question_set_id: questionSetId,
        question_type: questionData.question_type || 'MULTIPLE_CHOICE',
        prompt_text: questionData.prompt_text,
        position,
        time_limit_seconds: questionData.time_limit_seconds ?? 20,
      },
      { transaction: t }
    );

    const choiceRows = choicesData.map((c, idx) => ({
      question_id: question.id,
      choice_text: c.choice_text,
      position: idx + 1,
      is_correct: Boolean(c.is_correct),
    }));
    await Choice.bulkCreate(choiceRows, { transaction: t });

    return findById(question.id, { transaction: t });
  });
}

async function updateWithChoices(question, changes) {
  return sequelize.transaction(async (t) => {
    const questionFields = {};
    if (changes.question_type !== undefined) questionFields.question_type = changes.question_type;
    if (changes.prompt_text !== undefined) questionFields.prompt_text = changes.prompt_text;
    if (changes.time_limit_seconds !== undefined) questionFields.time_limit_seconds = changes.time_limit_seconds;

    if (Object.keys(questionFields).length > 0) {
      await question.update(questionFields, { transaction: t });
    }

    if (Array.isArray(changes.choices)) {
      await Choice.destroy({ where: { question_id: question.id }, transaction: t });
      const choiceRows = changes.choices.map((c, idx) => ({
        question_id: question.id,
        choice_text: c.choice_text,
        position: idx + 1,
        is_correct: Boolean(c.is_correct),
      }));
      await Choice.bulkCreate(choiceRows, { transaction: t });
    }

    return findById(question.id, { transaction: t });
  });
}

function remove(question) {
  return question.destroy();
}

module.exports = {
  findAllBySetId,
  findById,
  createWithChoices,
  updateWithChoices,
  remove,
};

