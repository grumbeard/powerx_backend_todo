class TodoList {
  constructor({ id, title, todos=[] }) {
    this.id = id;
    this.title = title;
    this.todos = todos;
    // this.uid = uid;
  }
}

module.exports = { TodoList };