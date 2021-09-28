const { TodoList } = require('../models/todo-list');
const { Item } = require('../models/item');

module.exports = (pool) => {
  const db = {
    ...require('./item')(pool)
  };
  
  db.findAllTodoLists = async () => {
    const res = await pool.query('SELECT * FROM TodoList');
    
    // For each TodoList, find all relevant Todos to display
    const todoLists = res.rows.map(async row => {
      const items = await pool.query('SELECT * FROM Item WHERE todoListId = $1', [row.id]);
      return new TodoList({...row, todos: items.rows.map(item => new Item(item))})
    });
    return await Promise.all(todoLists);
  };
  
  db.insertTodoList = async ({title, todos}) => {
    // Create new TodoList with provided Title
    const res = await pool.query('INSERT INTO TodoList (title) VALUES ($1) RETURNING *', [title]);
    let itemsData = []
    
    // Create Todos for TodoList if provided
    if (todos) {
      const items = todos.map(todo => db.insertItem({description: todo, todoListId: res.rows[0].id}));
      
      itemsData = await Promise.all(items);
    }
    return res.rowCount ? new TodoList({...res.rows[0], todos: itemsData.map(item => new Item(item))}) : null;
  };
  
  db.findTodoList = async (id) => {
    const res = await pool.query('SELECT * FROM TodoList WHERE id = $1', [id]);
    
    // If TodoList exists, find all relevant Todos to display
    if (res.rowCount > 0) {
      const items = await pool.query('SELECT * FROM Item WHERE todoListId = $1', [id]);
      return new TodoList({...res.rows[0], todos: items.rows.map(item => new Item(item))})
    }
    return null;
  };
  
  db.updateTodoList = async ({id, title, todos}) => {
    // Updates Title and/or Todos of TodoList
    
    // Update TodoList Title if provided
    const res = await pool.query(`
    UPDATE TodoList 
    SET 
      title = CASE WHEN $2::VARCHAR IS NOT NULL THEN $2 ELSE title END,
      updated_at = now()
    WHERE id = $1 RETURNING *
    `, [id, title]);
    
    // If TodoList exists, create new Todos if provided
    // NOTE: Old Todos will not be shown if new Todos provided
    if (res.rowCount > 0) {
      let itemsData = []
      if (todos) {
        const items = todos.map(async (todo) => db.insertItem({description: todo, todoListId: id}));
        
        itemsData = await Promise.all(items);
      }
      return new TodoList({...res.rows[0], todos: itemsData.map(item => new Item(item))})
    } 
    return null;
  }
  
  db.deleteTodoList = async (id) => {
    const res = await pool.query('UPDATE TodoList SET deleted_at = now() WHERE id = $1 RETURNING *', [id]);
    return res.rowCount ? new TodoList(res.rows[0]) : null;
  }
  
  return db;
}