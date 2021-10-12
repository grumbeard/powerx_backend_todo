const router = require('express').Router();

module.exports = (db, service) => {
  router.get('/', async (req, res, next) => {
    const { uid } = res;
    try {
      const todoLists = await db.findAllTodoLists({ uid });
      res.status(200).send(todoLists);
    }
    catch (error) { next(error) }
  })
  
  router.post('/', async (req, res, next) => {
    const { uid } = res;
    const { title, todos } = req.body;
    if (!title) return res.status(400).send('Title for TodoList not provided');
    try {
      const todoList = await db.insertTodoList({title, todos, uid});
      if (todoList) res.status(201).set('location', `/${todoList.id}`).send(todoList);
    }
    catch (error) { next(error) }
  })
  
  router.get('/:id', async (req, res, next) => {
    const { uid } = res;
    const id = req.params.id;
    try {
      // Check if TodoList exists
      const todoList = await db.findTodoList(id);
      if (!todoList) return res.status(400).send(`TodoList with id #${id} does not exist`);
      (todoList.access_list.includes(uid)) 
        ? res.status(200).send(todoList)
        : res.status(403).send('Unauthorized');
    }
    catch (error) { next(error) }
  })
  
  router.patch('/:id', async (req, res, next) => {
    const { uid } = res;
    const { title, todos } = req.body;
    try {
      // Check if TodoList exists
      const id = req.params.id;
      const todoList = await db.findTodoList(id);
      if (!todoList) return res.status(400).send(`TodoList with id #${id} does not exist`);
      // Update TodoList if account in Access List else return error
      (todoList.access_list.includes(uid))
        ? db.updateTodoList({id, title, todos})
          .then(updatedTodoList => res.status(200).send(updatedTodoList))
        : res.status(403).send('Unauthorized');
    }
    catch (error) { next(error) }
  })
  
  router.delete('/:id', async (req, res, next) => {
    const { uid } = res;
    try {
      // Check if TodoList exists
      const id = req.params.id;
      const todoList = await db.findTodoList(id);
      if (!todoList) return res.status(400).send(`TodoList with id #${id} does not exist`);
      // Delete TodoList if account in Access List else return error
      (todoList.access_list.includes(uid))
        ? db.deleteTodoList(id)
          .then(deletedTodoList => res.status(200).send(deletedTodoList))
        : res.status(403).send('Unauthorized');
    }
    catch (error) { next(error) }
  })
  
  router.post('/:id/access-list', async (req, res, next) => {
    const { uid } = res;
    const { email } = req.body;
    // Check if TodoList exists
    const id = req.params.id;
    try {
      const todoList = await db.findTodoList(id);
      if (!todoList) return res
        .status(400)
        .send(`TodoList of id #${id} doesn't exist`);
        
      // Check if Account is Owner of TodoList
      if (todoList.owner_id !== uid) return res
        .status(403)
        .send('Unauthorized');
      
      // Publish Add To List message
      await service.publishAddToList({ id, email });
      return res
        .status(200)
        .send(`Requested to add '${email}' to Access List of TodoList #${id}`);
    }
    catch (err) {
      next(new Error(`Failed to request to add '${email}' to Access List of TodoList #${id}`, { cause: err }));
    }
  });
  
  return router;
}