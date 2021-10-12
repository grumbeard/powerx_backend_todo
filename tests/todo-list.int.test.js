const request = require('supertest');
const { TodoList } = require('../src/models/todo-list');
const { utils } = require('./utils');

const app = utils.app;
const db = utils.db;

const email1 = 'john.doe@example.com';
const password1 = 'password';
const email2 = 'jane.doe@example.com';
const password2 = 'password';
let token1;
let token2;
const title = 'TodoList title';
const todos = ['todo1', 'todo2'];

beforeAll(async () => {
  await utils.setup();
});

afterAll(async () => {
  await utils.teardown();
});

describe('GET /todo', () => {
  beforeAll(async () => {
    await db.clearAccountTable();
  });
  
  it('should respond with status code 200', async () => {
    token1 = await utils.registerUser({ email: email1, password: password1 });
    return request(app)
      .get('/todo')
      .set('authorization', `Bearer ${token1}`)
      .expect(200);
  });
});

describe('POST /todo', () => {
  beforeAll(async () => {
    await db.clearItemTable();
    await db.clearTodoListTable();
    await db.clearAccountTable();
    token1 = await utils.registerUser({ email: email1, password: password1 });
  });
  
  describe('given uid', () => {
    it('should respond with status code 400 if title not provided', async () => {
      return request(app)
        .post('/todo')
        .set('authorization', `Bearer ${token1}`)
        .expect(400)
        .then(async response => {
          // Response body does not have TodoList
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('owner_id');
          expect(response.body).not.toHaveProperty('access_list');
          expect(response.body).not.toHaveProperty('title');
          // No TodoList created in db
          const todoLists = await db.findAllTodoLists({ uid: 1 });
          expect(todoLists).toHaveLength(0);
        });
    });
  });
  
  describe('given uid, title', () => {
    it('should respond with status code 201 and create and return new TodoList', async () => {
      return request(app)
        .post('/todo')
        .set('authorization', `Bearer ${token1}`)
        .send({ title })
        .expect(201)
        .expect('location', /^\/[0-9]+$/)
        .then(async response => {
          // Response body has new TodoList
          expect(response.body).toMatchObject(new TodoList({ id: 1, owner_id: 1, access_list: [1], title }));
          // New TodoList can be found in db
          const todoList = await db.findTodoList(1);
          expect(todoList).toMatchObject(new TodoList({ id: 1, owner_id: 1, access_list: [1], title }));
        });
    });
  });
  
  describe('given uid, title and todos', () => {
    it('should respond with status code 201 and create and return new TodoList with todos', async () => {
      return request(app)
        .post('/todo')
        .set('authorization', `Bearer ${token1}`)
        .send({ title, todos })
        .expect(201)
        .expect('location', /^\/[0-9]+$/)
        .then(async response => {
          // Response body has new TodoList
          expect(response.body).toMatchObject(new TodoList({ id: 2, owner_id: 1, access_list: [1], title }));
          const todoList = await db.findTodoList(2);
          // New TodoList can be found in db
          expect(todoList).toMatchObject(new TodoList({ id: 2, owner_id: 1, access_list: [1], title }));
          // New Items for TodoList (as provided) can be found in db
          const todos = await db.findAllItemsByTodoListId(2);
          expect(todos).toEqual(todos);
        });
    });
  });
});

describe('GET /todo/:id', () => {
  beforeAll(async () => {
    await db.clearItemTable();
    await db.clearTodoListTable();
    await db.clearAccountTable();
    token1 = await utils.registerUser({ email: email1, password: password1 });
    token2 = await utils.registerUser({ email: email2, password: password2 });
  });
  
  describe('given id, uid', () => {
    const validTodoListId = 1;
    const invalidTodoListId = 2;
    
    beforeAll(async () => {
      await db.insertTodoList({ title, todos, uid: 1 });
    });
    
    it('should respond with status code 400 if TodoList does not exist', async () => {
      return request(app)
        .get(`/todo/${invalidTodoListId}`)
        .set('authorization', `Bearer ${token1}`)
        .expect(400)
        .then(response => {
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('title');
          expect(response.body).not.toHaveProperty('owner_id');
          expect(response.body).not.toHaveProperty('access_list');
        });
    });
    
    it('should respond with status code 403 if Account not in access list', async () => {
      return request(app)
        .get(`/todo/${validTodoListId}`)
        .set('authorization', `Bearer ${token2}`)
        .expect(403)
        .then(response => {
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('title');
          expect(response.body).not.toHaveProperty('owner_id');
          expect(response.body).not.toHaveProperty('access_list');
        });
    });
    
    it('should respond with status code 200 and return correct TodoList', async () => {
      return request(app)
        .get(`/todo/${validTodoListId}`)
        .set('authorization', `Bearer ${token1}`)
        .expect(200)
        .then(async response => {
          expect(response.body).toMatchObject(new TodoList({ id: validTodoListId, title, owner_id: 1, access_list: [1] }));
          // Items for TodoList can be found in db
          const todoListTodos = await db.findAllItemsByTodoListId(1);
          expect(todoListTodos.map(todo => todo.description)).toEqual(expect.arrayContaining(todos));
          expect(todoListTodos).toHaveLength(todos.length);
        });
    });
  });
});

describe('PATCH /todo/:id', () => {
  beforeAll(async () => {
    await db.clearItemTable();
    await db.clearTodoListTable();
    await db.clearAccountTable();
    token1 = await utils.registerUser({ email: email1, password: password1 });
    token2 = await utils.registerUser({ email: email2, password: password2 });
  });
  
  describe('given id, uid', () => {
    const validTodoListId = 1;
    const invalidTodoListId = 2;
    
    beforeAll(async () => {
      await db.clearItemTable();
      await db.clearTodoListTable();
      await db.insertTodoList({ title, todos, uid: 1 });
    });
    
    it('should respond with status 400 if TodoList does not exist', async () => {
      return request(app)
        .patch(`/todo/${invalidTodoListId}`)
        .set('authorization', `Bearer ${token1}`)
        .expect(400)
        .then(response => {
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('title');
          expect(response.body).not.toHaveProperty('owner_id');
          expect(response.body).not.toHaveProperty('access_list');
        });
    });
    
    it('should respond with status 403 if Account not in access list', async () => {
      return request(app)
        .patch(`/todo/${validTodoListId}`)
        .set('authorization', `Bearer ${token2}`)
        .expect(403)
        .then(async response => {
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('title');
          expect(response.body).not.toHaveProperty('owner_id');
          expect(response.body).not.toHaveProperty('access_list');
          // Original TodoList can be found in db
          const todoList = await db.findTodoList(validTodoListId);
          expect(todoList).toMatchObject(new TodoList({ id: validTodoListId, title, owner_id: 1, access_list: [1] }));
          // No change in Items for TodoList in db
          const todoListTodos = await db.findAllItemsByTodoListId(validTodoListId);
          expect(todoListTodos.map(todo => todo.description)).toEqual(expect.arrayContaining(todos));
          expect(todoListTodos).toHaveLength(todos.length);
        });
    });
    
    it('should respond with status code 200 and return original TodoList', async () => {
      return request(app)
        .patch(`/todo/${validTodoListId}`)
        .set('authorization', `Bearer ${token1}`)
        .expect(200)
        .then(async response => {
          // Response body has original TodoList
          expect(response.body).toMatchObject(new TodoList({ id: validTodoListId, title, owner_id: 1, access_list: [1] }));
          // No change in Items for TodoList in db
          const todoListTodos = await db.findAllItemsByTodoListId(validTodoListId);
          expect(todoListTodos.map(todo => todo.description)).toEqual(expect.arrayContaining(todos));
          expect(todoListTodos).toHaveLength(todos.length);
        });
    });
  });
  
  describe('given id, uid, and other details', () => {
    const validTodoListId = 1;
    const newTitle1 = 'New TodoList Title1';
    const newTitle2 = 'New TodoList Title2';
    const newTodos1 = ['todo3'];
    const newTodos2 = ['todo4', 'todo5']
    
    beforeAll(async () => {
      await db.clearItemTable();
      await db.clearTodoListTable();
      await db.insertTodoList({ title, todos, uid: 1 });
    });
    
    it('should respond with status code 200 and return TodoList with updated title if provided', async () => {
      return request(app)
        .patch(`/todo/${validTodoListId}`)
        .set('authorization', `Bearer ${token1}`)
        .send({ title: newTitle1 })
        .expect(200)
        .then(async response => {
          // Response body has TodoList with updated title
          expect(response.body).toMatchObject(new TodoList({ id: validTodoListId, title: newTitle1, owner_id: 1, access_list: [1] }));
          // No change in Items for TodoList in db if not provided
          const todoListTodos = await db.findAllItemsByTodoListId(validTodoListId);
          expect(todoListTodos.map(todo => todo.description)).toEqual(expect.arrayContaining(todos));
          expect(todoListTodos).toHaveLength(todos.length);
        });
    });
    
    it('should respond with status code 200 and return TodoList with updated todos if provided', async () => {
      return request(app)
        .patch(`/todo/${validTodoListId}`)
        .set('authorization', `Bearer ${token1}`)
        .send({ todos: newTodos1 })
        .expect(200)
        .then(async response => {
          // Response body has TodoList with previously updated title
          expect(response.body).toMatchObject(new TodoList({ id: validTodoListId, title: newTitle1, owner_id: 1, access_list: [1] }));
          // No additional change in title for TodoList in db if not provided
          const todoList = await db.findTodoList(validTodoListId);
          expect(todoList).toMatchObject(new TodoList({ id: validTodoListId, title: newTitle1, owner_id: 1, access_list: [1] }));
          // Items for TodoList found in db correspond to new todos provided
          const todoListTodos = await db.findAllItemsByTodoListId(validTodoListId);
          expect(todoListTodos.map(todo => todo.description)).toEqual(expect.arrayContaining(newTodos1));
          expect(todoListTodos).toHaveLength(newTodos1.length);
        });
    });
    
    it('should respond with status code 200 and return TodoList with all updated details (multiple) provided', async () => {
      return request(app)
        .patch(`/todo/${validTodoListId}`)
        .set('authorization', `Bearer ${token1}`)
        .send({ title: newTitle2, todos: newTodos2 })
        .expect(200)
        .then(async response => {
          // Response body has TodoList with title updated back to original
          expect(response.body).toMatchObject(new TodoList({ id: validTodoListId, title: newTitle2, owner_id: 1, access_list: [1] }));
          // Title for TodoList in db corresponds to title provided
          const todoList = await db.findTodoList(validTodoListId);
          expect(todoList).toMatchObject(new TodoList({ id: validTodoListId, title: newTitle2, owner_id: 1, access_list: [1] }));
          // Items for TodoList found in db correspond to new todos provided
          const todoListTodos = await db.findAllItemsByTodoListId(validTodoListId);
          expect(todoListTodos.map(todo => todo.description)).toEqual(expect.arrayContaining(newTodos2));
          expect(todoListTodos).toHaveLength(newTodos2.length);
        });
    });
  });
});

describe('DELETE /todo/:id', () => {
  beforeAll(async () => {
    await db.clearItemTable();
    await db.clearTodoListTable();
    await db.clearAccountTable();
    token1 = await utils.registerUser({ email: email1, password: password1 });
    token2 = await utils.registerUser({ email: email2, password: password2 });
  });
  
  describe('given id, uid', () => {
    const validTodoListId = 1;
    const invalidTodoListId = 2;
    
    beforeAll(async () => {
      await db.clearItemTable();
      await db.clearTodoListTable();
      await db.insertTodoList({ title, todos, uid: 1 });
    });
    
    it('should respond with status 400 if TodoList does not exist', async () => {
      return request(app)
        .delete(`/todo/${invalidTodoListId}`)
        .set('authorization', `Bearer ${token1}`)
        .expect(400)
        .then(async response => {
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('title');
          expect(response.body).not.toHaveProperty('owner_id');
          expect(response.body).not.toHaveProperty('access_list');
          // TodoList can still be found in db (no soft-delete)
          const todoList = await db.findTodoList(validTodoListId);
          expect(todoList).toBeTruthy();
          // Items for TodoList can still be found in db
          const todoListTodos = await db.findAllItemsByTodoListId(validTodoListId);
          expect(todoListTodos.map(todo => todo.description)).toEqual(expect.arrayContaining(todos));
          expect(todoListTodos).toHaveLength(todos.length);
        });
    });
    
    it('should respond with status 403 if Account not in access list', async () => {
      return request(app)
        .delete(`/todo/${validTodoListId}`)
        .set('authorization', `Bearer ${token2}`)
        .expect(403)
        .then(async response => {
          // Response body has no TodoList
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('title');
          expect(response.body).not.toHaveProperty('owner_id');
          expect(response.body).not.toHaveProperty('access_list');
          // TodoList can still be found in db (no soft-delete)
          const todoList = await db.findTodoList(validTodoListId);
          expect(todoList).toBeTruthy();
          // Items for TodoList can still be found in db
          const todoListTodos = await db.findAllItemsByTodoListId(validTodoListId);
          expect(todoListTodos.map(todo => todo.description)).toEqual(expect.arrayContaining(todos));
          expect(todoListTodos).toHaveLength(todos.length);
        });
    });
    
    it('should respond with status code 200 and return and soft-delete TodoList', async () => {
      return request(app)
        .delete(`/todo/${validTodoListId}`)
        .set('authorization', `Bearer ${token1}`)
        .expect(200)
        .then(async response => {
          // Response body has soft-deleted TodoList
          expect(response.body).toMatchObject(new TodoList({ id: validTodoListId, title, owner_id: 1, access_list: [1] }));
          // TodoList cannot be found in db (soft-deleted)
          const todoList = await db.findTodoList(validTodoListId);
          expect(todoList).toBeFalsy();
          // Items for TodoList cannot be found in db (soft-deleted)
          const todoListTodos = await db.findAllItemsByTodoListId(validTodoListId);
          expect(todoListTodos).toBeFalsy();
        });
    });
  });
});

describe('POST /:id/access-list', () => {
  const validTodoListId = 1;
  const invalidTodoListId = 2;
  
  beforeAll(async () => {
    await db.clearItemTable();
    await db.clearTodoListTable();
    await db.clearAccountTable();
    token1 = await utils.registerUser({ email: email1, password: password1 });
    token2 = await utils.registerUser({ email: email2, password: password2 });
    await db.insertTodoList({ title, todos, uid: 1 });
  });
  
  it('should respond with status 400 if TodoList does not exist', async () => {
    return request(app)
      .post(`/todo/${invalidTodoListId}/access-list`)
      .set('authorization', `Bearer ${token1}`)
      .expect(400)
  });
  
  it('should respond with status 403 if Account not in access list', async () => {
    return request(app)
      .post(`/todo/${validTodoListId}/access-list`)
      .set('authorization', `Bearer ${token2}`)
      .expect(403)
  });
  
  it('should respond with status 200 and publish message', async () => {
    return request(app)
      .post(`/todo/${validTodoListId}/access-list`)
      .set('authorization', `Bearer ${token1}`)
      .expect(200)
  });
});