class Item {
  constructor({id, description, todo_list_id, is_completed=false}) {
    this.id = id;
    this.description = description;
    this.todo_list_id = todo_list_id;
    this.is_completed = is_completed;
  }
}

module.exports = { Item };