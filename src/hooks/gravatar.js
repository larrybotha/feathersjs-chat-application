// gravatar requires an MD5 hash of a user's email to get their avatar, so we'll
// use Node's crypto module to generate the hash
const crypto = require('crypto');

const gravatarUrl = 'https://s.gravatar.com/avatar';
// we want a 60x60 image
const query = 's=60';

// eslint-disable-next-line no-unused-vars
module.exports = function(options = {}) {
  return async context => {
    // the email we want to retrieve a gravatar for
    const {email} = context.data;
    // the hash of the email
    const hash = crypto
      .createHash('md5')
      .update(email)
      .digest('hex');

    // add the avatar to the data
    context.data.avatar = `${gravatarUrl}/${hash}?${query}`;

    return context;
  };
};
