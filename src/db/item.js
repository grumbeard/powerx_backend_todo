const { Item } = require('../models/item');

module.exports = (pool) => {
  const db = {};
  
  db.insertItem = async ({description, todo_list_id}) => {
    const res = await pool.query('INSERT INTO Item (description, todo_list_id) VALUES ($1, $2) RETURNING *', [description, todo_list_id]);
    return res.rowCount ? new Item(res.rows[0]) : null;
  };
  
  db.updateItem = async ({id, description}) => {    
    const res = await pool.query(`
    UPDATE Item 
    SET 
      description = $2,
      updated_at = now()
    WHERE id = $1 RETURNING *
    `, [id, description]);
    return res.rowCount ? new Item(res.rows[0]) : null;
  };
  
  db.deleteItem = async (id) => {
    const res = await pool.query('UPDATE Item SET deleted_at = now() WHERE id = $1 RETURNING *', [id]);
    return res.rowCount ? new Item(res.rows[0]) : null;
  };
  
  db.deleteAllItemsByTodoListId = async (todoListId) => {
    const res = await pool.query('UPDATE Item SET deleted_at = now() WHERE todo_list_id = $1 RETURNING *', [todoListId]);
    return res.rowCount ? res.rows.map(row => new Item(row)) : null;
  };
  
  db.findItem = async (id) => {
    const res = await pool.query('SELECT * FROM Item WHERE id = $1 AND deleted_at IS NULL', [id]);
    return res.rowCount ? new Item(res.rows[0]) : null;
  }
  
  db.findAllItemsByTodoListId = async (todoListId) => {
    const res = await pool.query('SELECT * FROM Item WHERE todo_list_id = $1 AND deleted_at IS NULL', [todoListId]);
    return res.rowCount ? res.rows.map(row => new Item(row)) : null;
  };
  
  return db;
}