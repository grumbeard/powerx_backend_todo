const router = require('express').Router();

module.exports = (db) => {
  router.get('/', async (req, res, next) => {
    const todoLists = await db.findAllTodoLists();
    res.status(200).send(todoLists);
  })
  
  router.post('/', async (req, res, next) => {
    const { title, todos } = req.body;
    const todoList = await db.insertTodoList({title, todos});
    res.status(201).send(todoList);
  })
  
  return router;
}