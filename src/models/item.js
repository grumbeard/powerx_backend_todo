class Item {
  constructor({id, description, todoListId}) {
    this.id = id;
    this.description = description;
    this.todoListId = todoListId;
  }
}

module.exports = { Item };