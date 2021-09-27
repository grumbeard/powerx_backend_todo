const router = require('express').Router();
const todoList = require('./todo-list');

module.exports = (db) => {
  router.get('/', (req, res) => {
    res.status(200).send('Homepage')
  })
  
  router.use('/todo', todoList(db));
  
  router.all('*', (req, res) => {
    res
      .status(404)
      .set({ 'Content-Type': 'text/html' })
      .send('<h1>No Page Found</h1><a href="/">Back</a>')
  });
  
  return router;
};