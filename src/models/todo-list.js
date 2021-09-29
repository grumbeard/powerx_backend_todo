class TodoList {
  constructor({ id, title, access_list=[], owner_id }) {
    this.id = id;
    this.title = title;
    this.access_list = access_list;
    this.owner_id = owner_id
  }
}

module.exports = { TodoList };