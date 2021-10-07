require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const App = require('../src/app');
const Router = require('../src/routes');
const AuthMiddleware = require('../src/middlewares/auth');
const AuthService = require('../src/services/auth');
const amqpService = require('../src/services/amqp');
const db = require('../src/db')();

const utils = {};

const authService = AuthService(db);
const authMiddleware = AuthMiddleware(authService);
const router = Router({ db, authService, authMiddleware, amqpService });
const app = App(router);

utils.app = app;
utils.db = db;

utils.setup = async () => {
  await db.initialize();
  await db.clearItemTable();
  await db.clearTodoListTable();
  await db.clearAccountTable();
};

utils.teardown = async () => {
  await db.drop();
  await db.end();
};

utils.registerUser = async ({ email, password }) => {
  // Mock AuthService by skipping validations in register method to ensure successful outcome
  const token = await authService.register({ email, password });
  return token;
};

module.exports = { utils };