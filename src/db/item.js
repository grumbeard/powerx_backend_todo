const { Item } = require('../models/item');

module.exports = (pool) => {
  const db = {};
  
  db.insertItem = async ({description, todoListId}) => {
    const res = await pool.query('INSERT INTO Item (description, todoListId) VALUES ($1, $2) RETURNING *', [description, todoListId]);
    return res.rowCount ? new Item(res.rows[0]) : null;
  }
  
  db.updateItem = async ({id, description}) => {    
    const res = await pool.query(`
    UPDATE Item 
    SET 
      description = $2,
      updated_at = now()
    WHERE id = $1 RETURNING *
    `, [id, description]);
    return res.rowCount ? new Item(res.rows[0]) : null;
  }
  
  db.deleteItem = async (id) => {
    const res = await pool.query('UPDATE Item SET deleted_at = now() WHERE id = $1 RETURNING *', [id]);
    return res.rowCount ? new Item(res.rows[0]) : null;
  }
  
  return db;
}