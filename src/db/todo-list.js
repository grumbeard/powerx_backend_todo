const { TodoList } = require('../models/todo-list');

module.exports = (pool) => {
  const db = {};
  
  db.findAllTodoLists = async () => {
    const res = await pool.query('SELECT * FROM TodoList');
    return res.rows.map(row => new TodoList(row));
  };
  
  db.insertTodoList = async ({title, todos}) => {
    const res = await pool.query('INSERT INTO TodoList (title, todos) VALUES ($1,$2) RETURNING *', [title, todos]);
    return res.rowCount ? new TodoList(res.rows[0]) : null;
  };
  
  db.findTodoList = async (id) => {
    const res = await pool.query('SELECT * FROM TodoList WHERE id = $1', [id]);
    return res.rowCount ? new TodoList(res.rows[0]) : null;
  };
  
  db.updateTodoList = async ({id, title, todos}) => {    
    const res = await pool.query(`
    UPDATE TodoList 
    SET 
      title = CASE WHEN $2::VARCHAR IS NOT NULL THEN $2 ELSE title END,
      todos = CASE WHEN $3::VARCHAR[] IS NOT NULL THEN $3 ELSE todos END
    WHERE id = $1 RETURNING *
    `, [id, title, todos]);
    return res.rowCount ? new TodoList(res.rows[0]) : null;
  }
  
  return db;
}