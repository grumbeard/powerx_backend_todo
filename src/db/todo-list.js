const { TodoList } = require('../models/todo-list');

module.exports = (pool) => {
  const db = {};
  
  db.findAllTodoLists = async () => {
    const res = await pool.query('SELECT * FROM TodoList');
    return res.rows.map(row => new TodoList(row));
  }
  
  db.insertTodoList = async ({title, todos}) => {
    const res = await pool.query('INSERT INTO TodoList (title, todos) VALUES ($1,$2) RETURNING *', [title, todos]);
    return res.rowCount ? new TodoList(res.rows[0]) : null;
  }
  
  return db;
}