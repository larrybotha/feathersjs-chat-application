// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function(options = {}) {
  return async context => {
    const {data} = context;

    if (!data.text) {
      throw new Error('A message must hve text');
    }

    // this is available because all service methods on the messages service
    // require authentication. The 'authenticate' hook from feathers adds the
    // user to params.
    const user = context.params.user;

    // limit message text to 400 chars
    const text = data.text.substring(0, 400);

    // explicitly rewrite the context data to prevent additional data from being
    // added by the user.
    context.data = {
      text,
      userId: user._id,
      createdAt: new Date().getTime(),
    };

    return context;
  };
};
