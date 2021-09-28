module.exports = (db) => {
  const service = {};
  
  service.validateAccount = async (email) =>
    await db.findAccountByEmail(email);
  
  service.addAccountToAccessList = async ({id, account}) => {
    const todoList = await db.findTodoList(id);
    let accessList = todoList.access_list;
    
    // Add Account to Access List if not already exist
    if (accessList.includes(account.id)) return todoList;
    accessList.push(account.id);
    
    return await db.updateTodoListAccess({ id, access_list: accessList });
  };
  
  return service;
}