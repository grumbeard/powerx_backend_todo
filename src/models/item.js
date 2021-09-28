class Item {
  constructor({id, description, todo_list_id}) {
    this.id = id;
    this.description = description;
    this.todo_list_id = todo_list_id;
  }
}

module.exports = { Item };