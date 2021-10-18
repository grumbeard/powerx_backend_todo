require('dotenv').config();
const cron = require('node-cron');
const WebSocket = require('ws');
const App = require('./app');
const Router = require('./routes');
const AuthService = require('./services/auth');
const AuthMiddleware = require('./middlewares/auth');
const AmqpService = require('./services/amqp');
const TaskCounterService = require('./services/task-counter');

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

// Create WebSocket Endpoint

const WS_PORT = process.env.WS_PORT || 3001;
const wss = new WebSocket.Server({
  port: WS_PORT,
  path: '/task-count'
});

// Initialize Task Counter Service with WebSocket Server
const taskCounterService = TaskCounterService({db, wss});

wss.on('connection', ws => {
  console.log('New Client connected');
  // Send new client current count
  taskCounterService.sendCount(ws);
  
  ws.on('message', msg => {
    ws.send(msg);
  })
});

cron.schedule('*/5 * * * *', taskCounterService.broadcastCount);