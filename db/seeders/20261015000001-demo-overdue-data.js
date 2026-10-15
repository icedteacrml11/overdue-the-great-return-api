module.exports = {
  async up(queryInterface) {
    const db = queryInterface.sequelize;
    await queryInterface.bulkInsert('users', [
      { school_id: '2099-0001', full_name: 'Librarian Clara Reyes', email: 'clara@overdue.test', role: 'HOST', created_at: new Date() },
      { school_id: '2099-0002', full_name: 'Admin Mateo Cruz', email: 'mateo@overdue.test', role: 'ADMIN', created_at: new Date() },
      { school_id: '2099-1001', full_name: 'Rina Santos', email: 'rina@overdue.test', role: 'PLAYER', created_at: new Date() },
      { school_id: '2099-1002', full_name: 'Dale Mendoza', email: 'dale@overdue.test', role: 'PLAYER', created_at: new Date() },
      { school_id: '2099-1003', full_name: 'Pao Villanueva', email: 'pao@overdue.test', role: 'PLAYER', created_at: new Date() },
      { school_id: '2099-1004', full_name: 'Bea Bautista', email: 'bea@overdue.test', role: 'PLAYER', created_at: new Date() },
    ]);
    const [[host]] = await db.query("SELECT user_id FROM users WHERE school_id = '2099-0001'");
    const [[rina]] = await db.query("SELECT user_id FROM users WHERE school_id = '2099-1001'");
    const [[dale]] = await db.query("SELECT user_id FROM users WHERE school_id = '2099-1002'");
    const [[pao]] = await db.query("SELECT user_id FROM users WHERE school_id = '2099-1003'");

    await queryInterface.bulkInsert('question_sets', [
      { host_id: host.user_id, title: 'Philippine Literature & Library Trivia', created_at: new Date() },
    ]);
    const [[qSet]] = await db.query("SELECT id FROM question_sets WHERE title = 'Philippine Literature & Library Trivia'");

    await queryInterface.bulkInsert('questions', [
      { question_set_id: qSet.id, question_type: 'MULTIPLE_CHOICE', prompt_text: 'Who wrote Noli Me Tangere?', position: 1, time_limit_seconds: 20 },
      { question_set_id: qSet.id, question_type: 'MULTIPLE_CHOICE', prompt_text: 'What classification system is most commonly used in university libraries?', position: 2, time_limit_seconds: 20 },
      { question_set_id: qSet.id, question_type: 'TRUE_FALSE', prompt_text: 'El Filibusterismo is the sequel to Noli Me Tangere.', position: 3, time_limit_seconds: 15 },
      { question_set_id: qSet.id, question_type: 'MULTIPLE_CHOICE', prompt_text: 'Which pen name was used by Marcelo H. del Pilar?', position: 4, time_limit_seconds: 20 },
      { question_set_id: qSet.id, question_type: 'TRUE_FALSE', prompt_text: 'Reference books like encyclopedias can normally be checked out for two weeks.', position: 5, time_limit_seconds: 15 },
    ]);
    const [questions] = await db.query(`SELECT id, position FROM questions WHERE question_set_id = ${qSet.id} ORDER BY position ASC`);
    const qMap = Object.fromEntries(questions.map((q) => [q.position, q.id]));

    await queryInterface.bulkInsert('choices', [
      { question_id: qMap[1], choice_text: 'Jose Rizal', position: 1, is_correct: true },
      { question_id: qMap[1], choice_text: 'Andres Bonifacio', position: 2, is_correct: false },
      { question_id: qMap[1], choice_text: 'Francisco Balagtas', position: 3, is_correct: false },
      { question_id: qMap[1], choice_text: 'Apolinario Mabini', position: 4, is_correct: false },
      { question_id: qMap[2], choice_text: 'Library of Congress Classification', position: 1, is_correct: true },
      { question_id: qMap[2], choice_text: 'Periodic Table System', position: 2, is_correct: false },
      { question_id: qMap[2], choice_text: 'Binary Index System', position: 3, is_correct: false },
      { question_id: qMap[2], choice_text: 'Chronological Ledger', position: 4, is_correct: false },
      { question_id: qMap[3], choice_text: 'True', position: 1, is_correct: true },
      { question_id: qMap[3], choice_text: 'False', position: 2, is_correct: false },
      { question_id: qMap[4], choice_text: 'Plaridel', position: 1, is_correct: true },
      { question_id: qMap[4], choice_text: 'Laong Laan', position: 2, is_correct: false },
      { question_id: qMap[4], choice_text: 'Taga-Ilog', position: 3, is_correct: false },
      { question_id: qMap[4], choice_text: 'Huseng Batute', position: 4, is_correct: false },
      { question_id: qMap[5], choice_text: 'True', position: 1, is_correct: false },
      { question_id: qMap[5], choice_text: 'False', position: 2, is_correct: true },
    ]);

    await queryInterface.bulkInsert('sessions', [
      {
        join_code: '482913',
        host_id: host.user_id,
        question_set_id: qSet.id,
        status: 'FINISHED',
        winner_player_id: null,
        started_at: new Date('2026-10-15T09:00:00.000Z'),
        ended_at: new Date('2026-10-15T09:25:00.000Z'),
        created_at: new Date('2026-10-15T08:50:00.000Z'),
      },
    ]);
    const [[session]] = await db.query("SELECT id FROM sessions WHERE join_code = '482913'");

    await queryInterface.bulkInsert('session_players', [
      { session_id: session.id, user_id: rina.user_id, nickname: 'Pageturner', score: 300, distance_progress: 10, question_started_at: new Date('2026-10-15T09:00:00.000Z') },
      { session_id: session.id, user_id: dale.user_id, nickname: 'Bookworm', score: 200, distance_progress: 8, question_started_at: new Date('2026-10-15T09:00:00.000Z') },
      { session_id: session.id, user_id: pao.user_id, nickname: 'Shelfie', score: 100, distance_progress: 5, question_started_at: new Date('2026-10-15T09:00:00.000Z') },
    ]);
    const [[pRina]] = await db.query(`SELECT id FROM session_players WHERE session_id = ${session.id} AND nickname = 'Pageturner'`);
    const [[pDale]] = await db.query(`SELECT id FROM session_players WHERE session_id = ${session.id} AND nickname = 'Bookworm'`);
    const [[pPao]] = await db.query(`SELECT id FROM session_players WHERE session_id = ${session.id} AND nickname = 'Shelfie'`);

    // Assign winner to the finished session
    await db.query(`UPDATE sessions SET winner_player_id = ${pRina.id} WHERE id = ${session.id}`);

    const [[q1Correct]] = await db.query(`SELECT id FROM choices WHERE question_id = ${qMap[1]} AND is_correct = true`);
    const [[q1Wrong]] = await db.query(`SELECT id FROM choices WHERE question_id = ${qMap[1]} AND is_correct = false LIMIT 1`);
    const [[q2Correct]] = await db.query(`SELECT id FROM choices WHERE question_id = ${qMap[2]} AND is_correct = true`);

    await queryInterface.bulkInsert('player_answers', [
      { session_player_id: pRina.id, question_id: qMap[1], choice_id: q1Correct.id, is_correct: true, answered_at: new Date('2026-10-15T09:05:00.000Z') },
      { session_player_id: pRina.id, question_id: qMap[2], choice_id: q2Correct.id, is_correct: true, answered_at: new Date('2026-10-15T09:10:00.000Z') },
      { session_player_id: pDale.id, question_id: qMap[1], choice_id: q1Correct.id, is_correct: true, answered_at: new Date('2026-10-15T09:05:00.000Z') },
      { session_player_id: pDale.id, question_id: qMap[2], choice_id: null, is_correct: false, answered_at: new Date('2026-10-15T09:10:00.000Z') },
      { session_player_id: pPao.id, question_id: qMap[1], choice_id: q1Wrong.id, is_correct: false, answered_at: new Date('2026-10-15T09:05:00.000Z') },
      { session_player_id: pPao.id, question_id: qMap[2], choice_id: q2Correct.id, is_correct: true, answered_at: new Date('2026-10-15T09:10:00.000Z') },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('player_answers', null, {});
    await queryInterface.bulkDelete('session_players', null, {});
    await queryInterface.bulkDelete('sessions', null, {});
    await queryInterface.bulkDelete('choices', null, {});
    await queryInterface.bulkDelete('questions', null, {});
    await queryInterface.bulkDelete('question_sets', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
