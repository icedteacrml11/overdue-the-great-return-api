const { app, request, bearer } = require('../setup/helpers');
const { sequelize } = require('../../src/models');

afterAll(() => sequelize.close());

describe('Sessions & Gameplay HTTP API', () => {
  test('Full game lifecycle: create session, join players, start, fetch question, submit answers, guard duplicates/skips, finish, and check leaderboard', async () => {
    const hostAuth = await bearer('2099-0001');
    const player1Auth = await bearer('2099-1001');
    const player2Auth = await bearer('2099-1002');

    // 1. Create a session on seeded question set 1
    const createRes = await request(app)
      .post('/api/v1/sessions')
      .set('Authorization', hostAuth)
      .send({ question_set_id: 1 });
    expect(createRes.status).toBe(201);
    const code = createRes.body.join_code;
    expect(code).toMatch(/^\d{6}$/);

    // 2. Player 1 joins (201), rejoins idempotently (200), Player 2 gets 409 on duplicate nickname then joins (201)
    const join1Res = await request(app)
      .post(`/api/v1/sessions/${code}/players`)
      .set('Authorization', player1Auth)
      .send({ nickname: 'AlphaReader' });
    expect(join1Res.status).toBe(201);

    const rejoin1Res = await request(app)
      .post(`/api/v1/sessions/${code}/players`)
      .set('Authorization', player1Auth)
      .send({ nickname: 'AlphaReader' });
    expect(rejoin1Res.status).toBe(200);

    const dupNickRes = await request(app)
      .post(`/api/v1/sessions/${code}/players`)
      .set('Authorization', player2Auth)
      .send({ nickname: 'AlphaReader' });
    expect(dupNickRes.status).toBe(409);
    expect(dupNickRes.body.error.code).toBe('NICKNAME_TAKEN');

    const join2Res = await request(app)
      .post(`/api/v1/sessions/${code}/players`)
      .set('Authorization', player2Auth)
      .send({ nickname: 'BetaReader' });
    expect(join2Res.status).toBe(201);

    // 3. Host starts the game -> status RUNNING, current_position 1
    const startRes = await request(app)
      .patch(`/api/v1/sessions/${code}`)
      .set('Authorization', hostAuth)
      .send({ status: 'RUNNING' });
    expect(startRes.status).toBe(200);
    expect(startRes.body.status).toBe('RUNNING');
    expect(startRes.body.current_position).toBe(1);

    // 4. GET /sessions/:code/question returns current question without is_correct
    const q1Res = await request(app)
      .get(`/api/v1/sessions/${code}/question`)
      .set('Authorization', player1Auth);
    expect(q1Res.status).toBe(200);
    const q1 = q1Res.body;
    expect(q1.position).toBe(1);
    expect(q1.choices.every((c) => c.is_correct === undefined)).toBe(true);

    // 5. Submit answer (201), duplicate answer (409 ALREADY_ANSWERED), invalid choice (400 INVALID_CHOICE)
    const ans1Res = await request(app)
      .post(`/api/v1/sessions/${code}/answers`)
      .set('Authorization', player1Auth)
      .send({ question_id: q1.id, choice_id: q1.choices[0].id });
    expect(ans1Res.status).toBe(201);
    expect(ans1Res.body.points_awarded).toBeGreaterThanOrEqual(0);

    const dupAnsRes = await request(app)
      .post(`/api/v1/sessions/${code}/answers`)
      .set('Authorization', player1Auth)
      .send({ question_id: q1.id, choice_id: q1.choices[0].id });
    expect(dupAnsRes.status).toBe(409);
    expect(dupAnsRes.body.error.code).toBe('ALREADY_ANSWERED');

    const badChoiceRes = await request(app)
      .post(`/api/v1/sessions/${code}/answers`)
      .set('Authorization', player2Auth)
      .send({ question_id: q1.id, choice_id: 99999 });
    expect(badChoiceRes.status).toBe(400);
    expect(badChoiceRes.body.error.code).toBe('INVALID_CHOICE');

    // 6. Skipping a question position returns 409 NOT_NEXT_QUESTION
    const skipRes = await request(app)
      .patch(`/api/v1/sessions/${code}`)
      .set('Authorization', hostAuth)
      .send({ current_position: 3 });
    expect(skipRes.status).toBe(409);
    expect(skipRes.body.error.code).toBe('NOT_NEXT_QUESTION');

    // 7. Advance to position 2 (200) and finish the game (200)
    const nextRes = await request(app)
      .patch(`/api/v1/sessions/${code}`)
      .set('Authorization', hostAuth)
      .send({ current_position: 2 });
    expect(nextRes.status).toBe(200);
    expect(nextRes.body.current_position).toBe(2);

    const finishRes = await request(app)
      .patch(`/api/v1/sessions/${code}`)
      .set('Authorization', hostAuth)
      .send({ status: 'FINISHED' });
    expect(finishRes.status).toBe(200);
    expect(finishRes.body.status).toBe('FINISHED');

    // 8. Leaderboard returns ranked players
    const lbRes = await request(app)
      .get(`/api/v1/sessions/${code}/leaderboard?limit=10`)
      .set('Authorization', player1Auth);
    expect(lbRes.status).toBe(200);
    expect(lbRes.body.leaderboard[0].nickname).toBe('AlphaReader');
    expect(lbRes.body.leaderboard[0].rank).toBe(1);
  });
});
