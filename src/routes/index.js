const router = require('express').Router();
const todoList = require('./todo-list');
const item = require('./item');
const auth = require('./auth');

module.exports = ({ db, authService, authMiddleware, amqpService }) => {
  router.get('/', (req, res) => {
    res.status(200).send('Please login at "/login" to access API')
  })
  
  router.use('/', auth(authService));
  // Use authentication for all routes defined below
  router.use(authMiddleware)
  
  router.use('/todo', todoList(db, amqpService));
  router.use('/item', item(db));
  
  router.all('*', (req, res) => {
    res
      .status(404)
      .set({ 'Content-Type': 'text/html' })
      .send('<h1>No Page Found</h1><a href="/">Back</a>')
  });
  
  return router;
};