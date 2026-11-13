jest.mock('../../src/services/session.service');
jest.mock('../../src/repositories/question.repository');
jest.mock('../../src/repositories/player.repository');
jest.mock('../../src/repositories/answer.repository');

const sessionService = require('../../src/services/session.service');
const questionRepository = require('../../src/repositories/question.repository');
const playerRepository = require('../../src/repositories/player.repository');
const answerRepository = require('../../src/repositories/answer.repository');
const { pointsFor, rankLeaderboard, submitAnswer } = require('../../src/services/gameplay.service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('pointsFor scoring rule', () => {
  const question = { time_limit_seconds: 20, points: 1000 };

  test('awards full points (1000) at 0 ms', () => {
    expect(pointsFor(question, true, 0)).toBe(1000);
  });

  test('awards 750 points half-way through the time limit (10000 ms)', () => {
    expect(pointsFor(question, true, 10000)).toBe(750);
  });

  test('awards 500 points exactly at the time limit (20000 ms)', () => {
    expect(pointsFor(question, true, 20000)).toBe(500);
  });

  test('awards 0 points for a wrong answer even at 0 ms', () => {
    expect(pointsFor(question, false, 0)).toBe(0);
  });

  test('awards 0 points when 1 ms late (20001 ms)', () => {
    expect(pointsFor(question, true, 20001)).toBe(0);
  });
});

describe('rankLeaderboard', () => {
  test('shares ranks on ties and skips the next rank (1, 2, 2, 4)', () => {
    const ranked = rankLeaderboard([
      { id: 1, user_id: 4, nickname: 'ReaderOne', score: 1500, distance_progress: 2 },
      { id: 2, user_id: 5, nickname: 'ReaderTwo', score: 1000, distance_progress: 1 },
      { id: 3, user_id: 6, nickname: 'ReaderThree', score: 1000, distance_progress: 1 },
      { id: 4, user_id: 7, nickname: 'ReaderFour', score: 500, distance_progress: 1 },
    ]);
    expect(ranked.map((r) => [r.nickname, r.rank])).toEqual([
      ['ReaderOne', 1],
      ['ReaderThree', 2],
      ['ReaderTwo', 2],
      ['ReaderFour', 4],
    ]);
  });
});

describe('submitAnswer unit checks', () => {
  test('refuses an answer when the caller is not seated and never calls recordAnswer', async () => {
    sessionService.findOrFail.mockResolvedValue({
      id: 10,
      status: 'RUNNING',
      current_position: 1,
      question_set_id: 1,
    });
    playerRepository.findSeat.mockResolvedValue(null);

    await expect(
      submitAnswer('123456', { question_id: 1, choice_id: 1 }, { user_id: 99 })
    ).rejects.toMatchObject({
      status: 403,
      code: 'FORBIDDEN',
    });

    expect(answerRepository.recordAnswer).not.toHaveBeenCalled();
  });

  test('refuses an answer when the session is not active (409 SESSION_NOT_ACTIVE)', async () => {
    sessionService.findOrFail.mockResolvedValue({
      id: 10,
      status: 'LOBBY',
      current_position: null,
      question_set_id: 1,
    });

    await expect(
      submitAnswer('123456', { question_id: 1, choice_id: 1 }, { user_id: 4 })
    ).rejects.toMatchObject({
      status: 409,
      code: 'SESSION_NOT_ACTIVE',
    });

    expect(answerRepository.recordAnswer).not.toHaveBeenCalled();
  });

  test('refuses an answer for a non-current question (409 NOT_CURRENT_QUESTION)', async () => {
    sessionService.findOrFail.mockResolvedValue({
      id: 10,
      status: 'RUNNING',
      current_position: 1,
      question_set_id: 1,
    });
    playerRepository.findSeat.mockResolvedValue({ id: 5, user_id: 4, distance_progress: 0 });
    questionRepository.findBySetAndPosition.mockResolvedValue({
      id: 1,
      position: 1,
      choices: [{ id: 10, is_correct: true }],
    });

    await expect(
      submitAnswer('123456', { question_id: 2, choice_id: 10 }, { user_id: 4 })
    ).rejects.toMatchObject({
      status: 409,
      code: 'NOT_CURRENT_QUESTION',
    });

    expect(answerRepository.recordAnswer).not.toHaveBeenCalled();
  });
});
