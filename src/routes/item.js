const router = require('express').Router();

module.exports = (db) => {
  router.post('/', async (req, res, next) => {
    const { description, todoListId } = req.body;
    const item = await db.insertItem({description, todoListId});
    if (item) res.status(201).send(item);
  })
  
  router.patch('/:id', async (req, res, next) => {
    const id = req.params.id;
    const { description } = req.body;
    const item = await db.updateItem({id, description});
    if (item) res.status(201).send(item);
  })
  
  router.delete('/:id', async (req, res, next) => {
    const id = req.params.id;
    const item = await db.deleteitem(id);
    if (item) res.status(200).send(item);
  })
  
  return router;
}