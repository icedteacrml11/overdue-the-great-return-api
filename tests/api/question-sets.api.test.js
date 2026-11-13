const path = require('path');
const { app, request, bearer } = require('../setup/helpers');
const { sequelize } = require('../../src/models');

afterAll(() => sequelize.close());

describe('Question Bank HTTP API', () => {
  test('GET /question-sets supports pagination, search, and rejects non-allowlisted sort (400 VALIDATION_FAILED)', async () => {
    const hostAuth = await bearer('2099-0001');

    const pageRes = await request(app)
      .get('/api/v1/question-sets?page=1&limit=2&sort=title&order=asc')
      .set('Authorization', hostAuth);
    expect(pageRes.status).toBe(200);
    expect(pageRes.body.meta).toMatchObject({ page: 1, limit: 2 });
    expect(Array.isArray(pageRes.body.data)).toBe(true);

    const emptySearch = await request(app)
      .get('/api/v1/question-sets?q=zzzz-no-match')
      .set('Authorization', hostAuth);
    expect(emptySearch.status).toBe(200);
    expect(emptySearch.body.data).toEqual([]);

    const badSort = await request(app)
      .get('/api/v1/question-sets?sort=password_hash')
      .set('Authorization', hostAuth);
    expect(badSort.status).toBe(400);
    expect(badSort.body.error.code).toBe('VALIDATION_FAILED');
  });

  test('GET /question-sets/:id?include=questions eager-loads questions and choices, and enforces ownership (403/404)', async () => {
    const host1Auth = await bearer('2099-0001');
    const host2Auth = await bearer('2099-0099');

    const includeRes = await request(app)
      .get('/api/v1/question-sets/1?include=questions')
      .set('Authorization', host1Auth);
    expect(includeRes.status).toBe(200);
    expect(includeRes.body.questions.length).toBeGreaterThanOrEqual(2);
    expect(includeRes.body.questions[0].choices.length).toBeGreaterThanOrEqual(2);

    const notOwnerRes = await request(app)
      .get('/api/v1/question-sets/1')
      .set('Authorization', host2Auth);
    expect(notOwnerRes.status).toBe(403);
    expect(notOwnerRes.body.error.code).toBe('FORBIDDEN');

    const missingRes = await request(app)
      .get('/api/v1/question-sets/9999')
      .set('Authorization', host1Auth);
    expect(missingRes.status).toBe(404);
    expect(missingRes.body.error.code).toBe('QUESTION_SET_NOT_FOUND');
  });

  test('Question CRUD and cover upload enforce single-correct-choice (400), frozen-if-used (409), and upload limits (200/400)', async () => {
    const hostAuth = await bearer('2099-0001');

    // Create a fresh mutable question set
    const createSetRes = await request(app)
      .post('/api/v1/question-sets')
      .set('Authorization', hostAuth)
      .send({
        title: 'Jest Mutable Set',
      });
    expect(createSetRes.status).toBe(201);
    const setId = createSetRes.body.id;

    // Two correct choices -> 400 VALIDATION_FAILED
    const badQRes = await request(app)
      .post(`/api/v1/question-sets/${setId}/questions`)
      .set('Authorization', hostAuth)
      .send({
        question_type: 'MULTIPLE_CHOICE',
        prompt_text: 'Invalid question with two correct choices?',
        time_limit_seconds: 20,
        choices: [
          { choice_text: 'Option A', is_correct: true },
          { choice_text: 'Option B', is_correct: true },
        ],
      });
    expect(badQRes.status).toBe(400);
    expect(badQRes.body.error.code).toBe('VALIDATION_FAILED');

    // Valid question creation -> 201
    const goodQRes = await request(app)
      .post(`/api/v1/question-sets/${setId}/questions`)
      .set('Authorization', hostAuth)
      .send({
        question_type: 'MULTIPLE_CHOICE',
        prompt_text: 'Which protocol powers the web?',
        time_limit_seconds: 20,
        choices: [
          { choice_text: 'HTTP', is_correct: true },
          { choice_text: 'SMTP', is_correct: false },
        ],
      });
    expect(goodQRes.status).toBe(201);
    const questionId = goodQRes.body.id;

    // Update and delete question on mutable set
    const patchQRes = await request(app)
      .patch(`/api/v1/question-sets/${setId}/questions/${questionId}`)
      .set('Authorization', hostAuth)
      .send({ prompt_text: 'Updated prompt question?' });
    expect(patchQRes.status).toBe(200);

    const delQRes = await request(app)
      .delete(`/api/v1/question-sets/${setId}/questions/${questionId}`)
      .set('Authorization', hostAuth);
    expect(delQRes.status).toBe(204);

    // Editing frozen set 1 -> 409 QUESTION_SET_IN_USE
    const frozenRes = await request(app)
      .patch('/api/v1/question-sets/1')
      .set('Authorization', hostAuth)
      .send({ title: 'Cannot Rename Used Set' });
    expect(frozenRes.status).toBe(409);
    expect(frozenRes.body.error.code).toBe('QUESTION_SET_IN_USE');

    // Upload valid PNG cover -> 200
    const coverPath = path.join(__dirname, '..', '..', 'postman', 'fixtures', 'cover.png');
    const uploadRes = await request(app)
      .put(`/api/v1/question-sets/${setId}/cover`)
      .set('Authorization', hostAuth)
      .attach('cover', coverPath);
    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.cover_url).toMatch(/^\/uploads\/covers\/set-/);

    // Upload missing file -> 400 COVER_REQUIRED
    const missingFileRes = await request(app)
      .put(`/api/v1/question-sets/${setId}/cover`)
      .set('Authorization', hostAuth);
    expect(missingFileRes.status).toBe(400);
    expect(missingFileRes.body.error.code).toBe('COVER_REQUIRED');
  });
});
