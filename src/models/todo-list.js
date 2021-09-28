class TodoList {
  constructor({ id, title, access_list=[] }) {
    this.id = id;
    this.title = title;
    this.access_list = access_list;
  }
}

module.exports = { TodoList };