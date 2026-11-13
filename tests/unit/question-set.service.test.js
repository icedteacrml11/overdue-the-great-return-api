jest.mock('../../src/repositories/question-set.repository');
jest.mock('../../src/repositories/question.repository');
jest.mock('../../src/repositories/session.repository');

const questionSetRepository = require('../../src/repositories/question-set.repository');
const questionRepository = require('../../src/repositories/question.repository');
const sessionRepository = require('../../src/repositories/session.repository');
const questionSetService = require('../../src/services/question-set.service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('question-set.service unit tests', () => {
  test('refuses editing a question set already used by a session (409 QUESTION_SET_IN_USE)', async () => {
    questionSetRepository.findById.mockResolvedValue({ id: 1, host_id: 1 });
    sessionRepository.countByQuestionSet.mockResolvedValue(2);

    await expect(
      questionSetService.update(1, { title: 'Renamed' }, { user_id: 1, role: 'HOST' })
    ).rejects.toMatchObject({
      status: 409,
      code: 'QUESTION_SET_IN_USE',
    });

    expect(questionSetRepository.update).not.toHaveBeenCalled();
  });

  test('refuses creating a question when caller is not the owner (403 FORBIDDEN)', async () => {
    questionSetRepository.findById.mockResolvedValue({ id: 1, host_id: 1 });

    await expect(
      questionSetService.createQuestion(1, { prompt: 'Test?' }, { user_id: 2, role: 'HOST' })
    ).rejects.toMatchObject({
      status: 403,
      code: 'FORBIDDEN',
    });

    expect(questionRepository.createWithChoices).not.toHaveBeenCalled();
  });
});
