const request = require('supertest');
const { Item } = require('../src/models/item');
const { utils } = require('./utils');

const app = utils.app;
const db = utils.db;

const email1 = 'john.doe@example.com';
const password1 = 'password';
const email2 = 'jane.doe@example.com';
const password2 = 'password';
const description = 'Item description';
let token1;
let token2;

beforeAll(async () => {
  await utils.setup();
});

afterAll(async () => {
  await utils.teardown();
});

describe('POST /item', () => {
  beforeAll(async () => {
    await db.clearItemTable();
    await db.clearTodoListTable();
    await db.clearAccountTable();
    token1 = await utils.registerUser({ email: email1, password: password1 });
    token2 = await utils.registerUser({ email: email2, password: password2 });
  });
  
  describe('given uid, description, todo_list_id', () => {
    const validTodoListId = 1;
    const invalidTodoListId = 2;
    
    beforeAll(async () => {
      await db.insertTodoList({ title: 'TodoList 1', todos: [], uid: 1 });
    });
    
    it('should respond with status code 400 if todo_list_id does not exist', async () => {
      return request(app)
        .post('/item')
        .set('authorization', `Bearer ${token1}`)
        .send({ description, todo_list_id: invalidTodoListId })
        .expect(400)
        .then(async response => {
          // Response body has no Item
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('description');
          expect(response.body).not.toHaveProperty('todo_list_id');
          // New Item cannot be found in db
          const item = await db.findItem(1);
          expect(item).toBeFalsy();
        });
    });
    
    it('should respond with status code 403 if Account not in access list', async() => {
      return request(app)
        .post('/item')
        .set('authorization', `Bearer ${token2}`)
        .send({ description, todo_list_id: validTodoListId })
        .expect(403)
        .then(async response => {
          // Response body has no Item
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('description');
          expect(response.body).not.toHaveProperty('todo_list_id');
          // New Item cannot be found in db
          const item = await db.findItem(1);
          expect(item).toBeFalsy();
        });
    });
    
    it('should respond with status code 200 and create and return Item', async() => {
      return request(app)
        .post('/item')
        .set('authorization', `Bearer ${token1}`)
        .send({ description, todo_list_id: validTodoListId })
        .expect(200)
        .then(async response => {
          // Response body has new Item
          expect(response.body).toMatchObject(new Item({ id: 1, description, todo_list_id: validTodoListId }));
          // New Item can be found in db
          const item = await db.findItem(1);
          expect(item).toMatchObject(new Item({ id: 1, description, todo_list_id: validTodoListId }));
        });
    });
  });
});

describe('PATCH /item/:id', () => {  
  beforeAll(async () => {
    await db.clearItemTable();
    await db.clearTodoListTable();
    await db.clearAccountTable();
    token1 = await utils.registerUser({ email: email1, password: password1 });
    token2 = await utils.registerUser({ email: email2, password: password2 });
  });
  
  describe('given uid, description, id', () => {
    const todoListId = 1;
    const validItemId = 1;
    const invalidItemId = 2;
    const newDescription = 'New Item description';
    
    beforeAll(async () => {
      await db.insertTodoList({ title: 'TodoList 1', todos: [], uid: 1 });
      await db.insertItem({ description, todo_list_id: 1 });
    });
    
    it('should respond with status code 400 if Item does not exist', async () => {
      return request(app)
        .patch(`/item/${invalidItemId}`)
        .set('authorization', `Bearer ${token1}`)
        .send({ description: newDescription, todo_list_id: todoListId })
        .expect(400)
        .then(async response => {
          // Response body has no Item
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('description');
          expect(response.body).not.toHaveProperty('todo_list_id');
          // Item with original description can be found in db
          const item = await db.findItem(1);
          expect(item.description).toBe(description);
        });
    });
    
    it('should respond with status code 403 if Account not in access list', async () => {
      return request(app)
        .patch(`/item/${validItemId}`)
        .set('authorization', `Bearer ${token2}`)
        .send({ description: newDescription, todo_list_id: todoListId })
        .expect(403)
        .then(async response => {
          // Response body has no Item
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('description');
          expect(response.body).not.toHaveProperty('todo_list_id');
          // Item with original description can be found in db
          const item = await db.findItem(1);
          expect(item.description).toBe(description);
        });
    });
    
    it('should respond with status code 200 and return updated Item', async () => {
      return request(app)
        .patch(`/item/${validItemId}`)
        .set('authorization', `Bearer ${token1}`)
        .send({ description: newDescription, todo_list_id: todoListId })
        .expect(200)
        .then(async response => {
          // Response body has Item with updated description
          expect(response.body).toMatchObject(new Item({
            id: validItemId,
            description: newDescription,
            todo_list_id: todoListId
          }));
          // Item with updated description can be found in db
          const item = await db.findItem(1);
          expect(item).toMatchObject(new Item({
            id: validItemId,
            description: newDescription,
            todo_list_id: todoListId
          }));
        });
    });
  });
});

describe('DELETE /item/:id', () => {  
  beforeAll(async () => {
    await db.clearItemTable();
    await db.clearTodoListTable();
    await db.clearAccountTable();
    token1 = await utils.registerUser({ email: email1, password: password1 });
    token2 = await utils.registerUser({ email: email2, password: password2 });
  });
  
  describe('given uid, id', () => {
    const todoListId = 1;
    const validItemId = 1;
    const invalidItemId = 2;
    
    beforeAll(async () => {
      await db.insertTodoList({ title: 'TodoList 1', todos: [], uid: 1 });
      await db.insertItem({ description, todo_list_id: 1 });
    });
    
    it('should respond with status code 400 if Item does not exist', async () => {
      return request(app)
        .delete(`/item/${invalidItemId}`)
        .set('authorization', `Bearer ${token1}`)
        .expect(400)
        .then(async response => {
          // Response body has no Item
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('description');
          expect(response.body).not.toHaveProperty('todo_list_id');
          // Item can still be found in db (no soft-delete)
          const item = await db.findItem(1);
          expect(item).toBeTruthy();
        });
    });
    
    it('should respond with status code 403 if Account not in access list', async () => {
      return request(app)
        .delete(`/item/${validItemId}`)
        .set('authorization', `Bearer ${token2}`)
        .expect(403)
        .then(async response => {
          // Response body has no Item
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('description');
          expect(response.body).not.toHaveProperty('todo_list_id');
          // Item can still be found in db (no soft-delete)
          const item = await db.findItem(1);
          expect(item).toBeTruthy();
        });
    });
    
    it('should respond with status code 200 and return and soft-delete Item', async () => {
      return request(app)
        .delete(`/item/${validItemId}`)
        .set('authorization', `Bearer ${token1}`)
        .expect(200)
        .then(async response => {
          // Response body has soft-deleted Item
          expect(response.body).toMatchObject(new Item({
            id: validItemId,
            description,
            todo_list_id: todoListId
          }));
          // Item cannot be found in db (soft-deleted)
          const item = await db.findItem(1);
          expect(item).toBeFalsy();
        });
    });
  });
});