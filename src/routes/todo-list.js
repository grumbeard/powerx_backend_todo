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
  
  router.get('/:id', async (req, res, next) => {
    const id = req.params.id;
    const todoList = await db.findTodoList(id);
    res.status(200).send(todoList);
  })
  
  router.patch('/:id', async (req, res, next) => {
    const id = req.params.id;
    const { title, todos } = req.body;
    const todoList = await db.updateTodoList({id, title, todos});
    res.status(201).send(todoList);
  })
  
  return router;
}