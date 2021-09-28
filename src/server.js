require('dotenv').config();
const App = require('./app');
const Router = require('./routes');
const AuthService = require('./services/auth');
const AuthMiddleware = require('./middlewares/auth');
const AmqpService = require('./services/amqp');

const db = require('./db')();

const authService = AuthService(db);
const authMiddleware = AuthMiddleware(authService);
const amqpService = AmqpService();

const router = Router({ db, authService, authMiddleware, amqpService });
const app = App(router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})