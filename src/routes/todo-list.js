const router = require('express').Router();

module.exports = (db) => {
  router.get('/', async (req, res, next) => {
    const todoLists = await db.findAllTodoLists();
    res.status(200).send(todoLists);
  })
  
  router.post('/', async (req, res, next) => {
    const { title, todos } = req.body;
    const todoList = await db.insertTodoList({title, todos});
    if (todoList) res.status(201).send(todoList);
  })
  
  router.get('/:id', async (req, res, next) => {
    const id = req.params.id;
    const todoList = await db.findTodoList(id);
    if (todoList) res.status(200).send(todoList);
  })
  
  router.patch('/:id', async (req, res, next) => {
    const id = req.params.id;
    const { title, todos } = req.body;
    const todoList = await db.updateTodoList({id, title, todos});
    if (todoList) res.status(201).send(todoList);
  })
  
  router.delete('/:id', async (req, res, next) => {
    const id = req.params.id;
    const todoList = await db.deleteTodoList(id);
    if (todoList) res.status(200).send(todoList);
  })
  
  return router;
}