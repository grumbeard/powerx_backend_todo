const { TodoList } = require('../models/todo-list');

module.exports = (pool) => {
  const db = {};
  
  db.findAllTodoLists = async () => {
    const res = await pool.query('SELECT * FROM TodoList');
    return res.rows.map(row => new TodoList(row));
  }
  
  return db;
}