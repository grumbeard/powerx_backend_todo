const router = require('express').Router();

module.exports = (db) => {
  router.post('/', async (req, res, next) => {
    const { uid } = res;
    const { description, todo_list_id } = req.body;
    const todoList = await db.findTodoList(todo_list_id);
    // Check if TodoList exists
    if (!todoList) return res
      .status(400)
      .send(`TodoList of id #${todo_list_id} doesn't exist`);
    // Check if Account in Access List of Item's TodoList
    if (!todoList.access_list.includes(uid)) return res
      .status(403)
      .send('Unauthorized');
    // Create Item for TodoList if Account in Access List
    const item = await db.insertItem({description, todo_list_id});
    if (item) res.status(200).send(item);
  })
  
  router.patch('/:id', async (req, res, next) => {
    const { uid } = res;
    const id = req.params.id;
    const { description } = req.body;
    // Check if Item exists
    const item = await db.findItem(id);
    if (!item) return res
      .status(400)
      .send(`Item of id #${id} doesn't exist`);
    // Check if Account in Access List of Item's TodoList
    const todoList = await db.findTodoList(item.todo_list_id);
    if (!todoList.access_list.includes(uid)) return res
      .status(403)
      .send('Unauthorized');
    // Update Item for TodoList if Account in Access List
    const updatedItem = await db.updateItem({id, description});
    if (updatedItem) res.status(200).send(updatedItem);
  })
  
  router.delete('/:id', async (req, res, next) => {
    const { uid } = res;
    const id = req.params.id;
    // Check if Item exists
    const item = await db.findItem(id);
    if (!item) return res
      .status(400)
      .send(`Item of id #${id} doesn't exist`);
    // Check if Account in Access List of Item's TodoList
    const todoList = await db.findTodoList(item.todo_list_id);
    if (!todoList.access_list.includes(uid)) return res
      .status(403)
      .send('Unauthorized');
    // Delete Item in TodoList if Account in Access List
    const deletedItem = await db.deleteItem(id);
    if (deletedItem) res.status(200).send(deletedItem);
  })
  
  return router;
}