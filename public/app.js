// establish a socket.io connection
const socket = io('http://localhost:3030');

// initialise our feathers app
const client = feathers();

// Configure our app to use socket.io for transport
client.configure(feathers.socketio(socket));

// configure feathers authentication using a localStorage as the storage
// strategy
client.configure(
  feathers.authentication({
    storage: window.localStorage,
  })
);

const addUser = user => {
  const userList = document.querySelector('.user-list');

  if (userList) {
    // add user to list
    userList.insertAdjacentHTML(
      'beforeend',
      `
      <li>
        <a class="block relative" href="#">
          <img src="${user.avatar}" alt="" class="avatar">
          <span class="absolute username">${user.email}</span>
        </a>
      </li>
    `
    );

    // update num users
    const userCount = document.querySelectorAll('.user-list li').length;

    document.querySelector('.online-count').innerHTML = userCount;
  }
};

const addMessage = message => {
  const {user = {}} = message;

  const chat = document.querySelector('.chat');

  const text = message.text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (chat) {
    chat.insertAdjacentHTML(
      'beforeend',
      `
      <div class="message flex flex-row">
        <img src="${user.avatar}" alt="${user.email}" class="avatar">
        <div class="message-wrapper">
          <p class="message-header">
            <span class="username font-600">${user.email}</span>
            <span class="sent-date font-300">${moment(message.createdAt).format(
              'MMM Do, hh:mm:ss'
            )}</span>
          </p>
          <p class="message-content font-300">${text}</p>
        </div>
      </div>
    `
    );
  }

  chat.scrollTop = chat.scrollHeight - chat.clientHeight;
};

const showLogin = (error = {}) => {
  if (document.querySelectorAll('.login').length) {
    document
      .querySelector('.heading')
      .insertAdjacentHTML('beforeend', `There was an error logging you in`);
  } else {
    document.getElementById('app').innerHTML = loginHTML;
  }
};

const showChat = async () => {
  document.getElementById('app').innerHTML = chatHTML;

  // from the messages service, asynchronously fetch messages
  const messages = await client.service('messages').find({
    // make a query for messages
    query: {
      // sorting the messages from newest to oldest
      $sort: {createdAt: -1},
      // and retreiving a maximum of 25
      $limit: 25,
    },
  });

  // and then display the messages once the service resolves
  messages.data
    .slice()
    .reverse()
    .map(addMessage);

  // then, asynchronously get the users, blocking further execution
  const users = await client.service('users').find({});

  // and display them once we have a response.
  users.data.map(addUser);

  // The above two tasks could have been run in parallel using Promise.all,
  // or by executing both functions, and then assigning them with an await
  // after they're both pending
  // e.g.
  // const messagesPromise = client.service('messages').find(...)
  // const usersPromise = client.service('users').find(...)
  //
  // const messages = await messagesPromise;
  // const users = await usersPromise;

  // or instead using Promise.all:
  // const [messages, users] = await Promise.all([
  //    client.services('messages').find(...),
  //    client.services('users').find(...),
  // ]);
};

const getCredentials = () => {
  const user = {
    email: document.querySelector('[name="email"]').value,
    password: document.querySelector('[name="password"]').value,
  };

  return user;
};

const login = async credentials => {
  try {
    if (!credentials) {
      // if no credentials, use JWT from localStorage
      await client.authenticate();
    } else {
      const payload = Object.assign({strategy: 'local'}, credentials);

      await client.authenticate(payload);
    }

    showChat();
  } catch (error) {
    showLogin(error);
  }
};

document.addEventListener('click', async e => {
  switch (e.target.id) {
    case 'signup':
      // get credentials from the signup / login form
      const credentials = getCredentials();

      // create a user with the provided credentials
      await client.service('users').create(credentials);

      // log the user in
      await login(credentials);

      break;

    case 'login':
      // get the credentials from the form
      const user = getCredentials();

      // log the user in
      await login(user);

      break;

    case 'logout':
      // use feathersjs' logout method
      await client.logout();

      document.getElementById('app').innerHTML = loginHTML;

      break;
  }
});

document.addEventListener('submit', async e => {
  if (e.target.id === 'send-message') {
    const input = document.querySelector('[name="text"]');

    e.preventDefault();

    await client.service('messages').create({
      text: input.value,
    });

    input.value = '';
  }
});

// add a realtime listener to the messages service when a message is created,
// and then execute addMessage
client.service('messages').on('created', addMessage);

// add a real-time listener for a user being created, and then execute addUser
client.service('users').on('created', addUser);

// execute login to either log the user in, or show the log in form
login();

// Login screen
const loginHTML = `<main class="login container">
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet text-center heading">
      <h1 class="font-100">Log in or signup</h1>
    </div>
  </div>
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">
      <form class="form">
        <fieldset>
          <input class="block" type="email" name="email" placeholder="email">
        </fieldset>

        <fieldset>
          <input class="block" type="password" name="password" placeholder="password">
        </fieldset>

        <button type="button" id="login" class="button button-primary block signup">
          Log in
        </button>

        <button type="button" id="signup" class="button button-primary block signup">
          Sign up and log in
        </button>
      </form>
    </div>
  </div>
</main>`;

// Chat base HTML (without user list and messages)
const chatHTML = `<main class="flex flex-column">
  <header class="title-bar flex flex-row flex-center">
    <div class="title-wrapper block center-element">
      <img class="logo" src="http://feathersjs.com/img/feathers-logo-wide.png"
        alt="Feathers Logo">
      <span class="title">Chat</span>
    </div>
  </header>

  <div class="flex flex-row flex-1 clear">
    <aside class="sidebar col col-3 flex flex-column flex-space-between">
      <header class="flex flex-row flex-center">
        <h4 class="font-300 text-center">
          <span class="font-600 online-count">0</span> users
        </h4>
      </header>

      <ul class="flex flex-column flex-1 list-unstyled user-list"></ul>
      <footer class="flex flex-row flex-center">
        <a href="#" id="logout" class="button button-primary">
          Sign Out
        </a>
      </footer>
    </aside>

    <div class="flex flex-column col col-9">
      <main class="chat flex flex-column flex-1 clear"></main>

      <form class="flex flex-row flex-space-between" id="send-message">
        <input type="text" name="text" class="flex flex-1">
        <button class="button-primary" type="submit">Send</button>
      </form>
    </div>
  </div>
</main>`;
