const { TodoList } = require('../models/todo-list');
const { Item } = require('../models/item');

module.exports = (pool) => {
  const db = {
    ...require('./item')(pool)
  };
  
  db.findAllTodoLists = async ({ uid }) => {
    const res = await pool.query('SELECT * FROM TodoList WHERE $1 = ANY (access_list) AND deleted_at IS NULL', [uid]);
    
    // For each TodoList, find all relevant Todos to display
    const todoLists = res.rows.map(async row => {
      const items = await db.findAllItemsByTodoListId(row.id);
      const todoList = new TodoList(row);
      todoList.todos = items ? items : [];
      return todoList;
    });
    return await Promise.all(todoLists);
  };
  
  db.insertTodoList = async ({ title, todos, uid }) => {
    // Create new TodoList with provided Title
    const res = await pool.query('INSERT INTO TodoList (title, access_list) VALUES ($1, $2) RETURNING *', [title, [uid]]);
    let items = []
    
    // Create Todos for TodoList if provided
    if (todos) {
      const itemsCreated = todos.map(todo => db.insertItem({description: todo, todo_list_id: res.rows[0].id}));
      
      items = await Promise.all(itemsCreated);
    }
    if (res.rowCount) {
      const todoList = new TodoList(res.rows[0]);
      todoList.todos = items.map(item => new Item(item));
      return todoList;
    }
    return null;
  };
  
  db.findTodoList = async (id) => {
    const res = await pool.query('SELECT * FROM TodoList WHERE id = $1 AND deleted_at IS NULL', [id]);
    
    // If TodoList exists, find all relevant Todos to display
    if (res.rowCount > 0) {
      const items = await db.findAllItemsByTodoListId(id);
      const todoList = new TodoList(res.rows[0]);
      todoList.todos = items ? items : [];
      return todoList;
    }
    return null;
  };
  
  db.updateTodoList = async ({ id, title, todos }) => {
    // Update TodoList Title if provided
    const res = await pool.query(`
    UPDATE TodoList 
    SET 
      title = CASE WHEN $2::VARCHAR IS NOT NULL THEN $2 ELSE title END,
      updated_at = now()
    WHERE id = $1 RETURNING *
    `, [id, title]);
    
    // If TodoList exists, create new Todos if provided
    // Delete old Todos if new Todos provided
    if (res.rowCount > 0) {
      let items = []
      if (todos) {
        await db.deleteAllItemsByTodoListId(id);
        const itemsCreated = todos.map(async (todo) => db.insertItem({description: todo, todo_list_id: id}));
        
        items = await Promise.all(itemsCreated);
      }
      const todoList = new TodoList(res.rows[0]);
      todoList.todos = items.map(item => new Item(item));
      return todoList;
    } 
    return null;
  }
  
  db.deleteTodoList = async (id) => {
    const deletedItems = await db.deleteAllItemsByTodoListId(id);
    const res = await pool.query('UPDATE TodoList SET deleted_at = now() WHERE id = $1 RETURNING *', [id]);
    if (res.rowCount) {
      const deletedTodoList = new TodoList(res.rows[0]);
      deletedTodoList.todos = deletedItems ? deletedItems : [];
      return deletedTodoList;
    }
    return null;
  }
  
  return db;
}