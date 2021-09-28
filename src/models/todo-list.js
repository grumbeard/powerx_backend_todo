class TodoList {
  constructor({ id, title, todos=[], access_list=[] }) {
    this.id = id;
    this.title = title;
    this.todos = todos;
    this.access_list = access_list;
  }
}

module.exports = { TodoList };