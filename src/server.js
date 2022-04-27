require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const notes = require('./api/notes');
const users = require('./api/users');
const authentications = require('./api/authentications');

const NotesService = require('./services/postgres/NotesService');
const UserService = require('./services/postgres/UserService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');

const NotesValidator = require('./validator/note');
const UsersValidator = require('./validator/user');
const AuthenticationsValidator = require('./validator/authentication');

const TokenManager = require('./tokenize/TokenManager');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  const notesService = new NotesService();
  const usersService = new UserService();
  const authenticationsService = new AuthenticationsService();

  await server.register({
    plugin: Jwt,
  });

  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
