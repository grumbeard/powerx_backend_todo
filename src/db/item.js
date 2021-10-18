const { Item } = require('../models/item');

module.exports = (pool) => {
  const db = {};
  
  db.insertItem = async ({description, todo_list_id, is_completed}) => {
    const res = await pool.query('INSERT INTO Item (description, todo_list_id, is_completed) VALUES ($1, $2, $3) RETURNING *', [description, todo_list_id, is_completed]);
    return res.rowCount ? new Item(res.rows[0]) : null;
  };
  
  db.updateItem = async ({id, description, is_completed}) => {    
    const res = await pool.query(`
    UPDATE Item 
    SET 
      description = CASE WHEN $2::VARCHAR IS NOT NULL THEN $2 ELSE description END,
      updated_at = now(),
      is_completed = CASE WHEN $3::BOOLEAN IS NOT NULL THEN $3 ELSE is_completed END
    WHERE id = $1 RETURNING *
    `, [id, description, is_completed]);
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
  
  db.countAllCompletedItems = async () => {
    const res = await pool.query('SELECT COUNT(*) FROM Item WHERE is_completed = true');
    return res.rowCount ? res.rows[0].count : 0;
  };
  
  return db;
}