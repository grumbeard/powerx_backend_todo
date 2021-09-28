class Item {
  constructor({id, description, todoListId}) {
    this.id = id;
    this.description = description;
    this.todo_list_id = todoListId;
  }
}

module.exports = { Item };