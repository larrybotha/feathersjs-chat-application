const {authenticate} = require('@feathersjs/authentication').hooks;

const populateUser = require('../../hooks/populate-user');

module.exports = {
  before: {
    // this limits requests to the messages service to only users who
    // are authenticated
    // This also automatically params.user only for authenticated users
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [populateUser()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
