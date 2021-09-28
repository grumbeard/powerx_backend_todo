const router = require('express').Router();

module.exports = (db) => {
  router.get('/', async (req, res, next) => {
    const { uid } = res;
    const todoLists = await db.findAllTodoLists({ uid });
    res.status(200).send(todoLists);
  })
  
  router.post('/', async (req, res, next) => {
    const { uid } = res;
    const { title, todos } = req.body;
    const todoList = await db.insertTodoList({title, todos, uid});
    if (todoList) res.status(201).send(todoList);
  })
  
  router.get('/:id', async (req, res, next) => {
    const { uid } = res;
    const id = req.params.id;
    // Check if TodoList exists
    const todoList = await db.findTodoList(id);
    if (todoList) {
      (todoList.access_list.includes(uid)) 
        ? res.status(200).send(todoList)
        : res.status(401).send('Unauthorized');
    }
  })
  
  router.patch('/:id', async (req, res, next) => {
    const { uid } = res;
    const { title, todos } = req.body;
    // Check if TodoList exists
    const id = req.params.id;
    const todoList = await db.findTodoList(id);
    if (todoList) {
      // Update TodoList if account in Access List else return error
      (todoList.access_list.includes(uid))
        ? db.updateTodoList({id, title, todos})
          .then(updatedTodoList => res.status(201).send(updatedTodoList))
        : res.status(401).send('Unauthorized');
    }
  })
  
  router.delete('/:id', async (req, res, next) => {
    const { uid } = res;
    // Check if TodoList exists
    const id = req.params.id;
    const todoList = await db.findTodoList(id);
    if (todoList) {
      // Delete TodoList if account in Access List else return error
      (todoList.access_list.includes(uid))
        ? db.deleteTodoList(id)
          .then(deletedTodoList => res.status(200).send(deletedTodoList))
        : res.status(401).send('Unauthorized');
    }
  })
  
  return router;
}