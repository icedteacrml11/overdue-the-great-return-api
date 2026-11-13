// A database rule was broken -> what the client should hear.
// The key is the constraint name from YOUR migration. PostgreSQL names a
// foreign key "<table>_<column>_fkey" when the migration does not name it.
// Write one entry for each constraint a client can hit. Example:
//
//   uq_player_nickname: {
//     status: 409,
//     code: 'NICKNAME_TAKEN',
//     message: 'That nickname is already used in this game.',
//   },
//
// A constraint that is not listed here still answers 409, with the code CONFLICT.
module.exports = {
  users_school_id_key: {
    status: 409,
    code: 'SCHOOL_ID_TAKEN',
    message: 'An account with that school ID already exists.',
  },
  users_email_key: {
    status: 409,
    code: 'EMAIL_TAKEN',
    message: 'An account with that email address already exists.',
  },
  uq_player_nickname: {
    status: 409,
    code: 'NICKNAME_TAKEN',
    message: 'That nickname is already used in this game.',
  },
  sessions_question_set_id_fkey: {
    status: 409,
    code: 'QUESTION_SET_IN_USE',
    message: 'This question set was used in a game and cannot be deleted.',
  },
  uq_one_seat: {
    status: 409,
    code: 'ALREADY_JOINED',
    message: 'You already have a seat in this game.',
  },
  sessions_join_code_key: {
    status: 409,
    code: 'JOIN_CODE_TAKEN',
    message: 'That join code is already in use.',
  },
  uq_one_answer: {
    status: 409,
    code: 'ALREADY_ANSWERED',
    message: 'You have already answered this question.',
  },
};
