// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function(options = {}) {
  return async context => {
    const {app, method, result, params} = context;

    // if the service method is 'find', then just use the data, otherwise wrap
    // the result in an array
    const messages = method === 'find' ? result.data : [result];

    // asynchronously add each user to their message
    await Promise.all(
      messages.map(async message => {
        // we pass the params of the service method call to the request for the
        // user so that the same information is available to the service method
        // call
        const user = await app.service('users').get(message.userId, params);

        // add the user to the message
        message.user = user;
      })
    );

    // hooks should always return context as a best practice
    return context;
  };
};
