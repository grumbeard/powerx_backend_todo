const router = require('express').Router();

module.exports = (db) => {
  router.get('/', async (req, res, next) => {
    const todoLists = await db.findAllTodoLists();
    res.status(200).send(todoLists);
  })
  
  return router;
}