const request = require('supertest');
const { Item } = require('../src/models/item');
const { utils } = require('./utils');

const app = utils.app;
const db = utils.db;

const email1 = 'john.doe@example.com';
const password1 = 'password';

const email2 = 'jane.doe@example.com';
const password2 = 'password';

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
  });
  
  describe('given uid, description, todo_list_id', () => {
    let token1;
    let token2;
    const validTodoListId = 1;
    const invalidTodoListId = 2;
    const description = 'Item description';
    
    beforeAll(async () => {
      token1 = await utils.registerUser({ email: email1, password: password1 });
      token2 = await utils.registerUser({ email: email2, password: password2 });
      await db.insertTodoList({ title: 'TodoList 1', todos: [], uid: 1 });
    });
    
    it('should return status code 400 if todo_list_id does not exist', async () => {
      return request(app)
        .post('/item')
        .set('authorization', `Bearer ${token1}`)
        .send({ description, todo_list_id: invalidTodoListId })
        .expect(400)
        .then(response => {
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('description');
          expect(response.body).not.toHaveProperty('todo_list_id');
        });
    });
    
    it('should return status code 403 if account not in access list', async() => {
      return request(app)
        .post('/item')
        .set('authorization', `Bearer ${token2}`)
        .send({ description, todo_list_id: validTodoListId })
        .expect(403)
        .then(response => {
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('description');
          expect(response.body).not.toHaveProperty('todo_list_id');
        });
    });
    
    it('should return status code 200 and return item', async() => {
      return request(app)
        .post('/item')
        .set('authorization', `Bearer ${token1}`)
        .send({ description, todo_list_id: validTodoListId })
        .expect(200)
        .then(response => {
          expect(response.body).toMatchObject(new Item({ id: 1, description, todo_list_id: validTodoListId }));
        });
    });
  });
});

describe('PATCH /item/:id', () => {  
  beforeAll(async () => {
    await db.clearItemTable();
    await db.clearTodoListTable();
    await db.clearAccountTable();
  });
  
  describe('given uid, description, id', () => {
    let token1;
    let token2;
    const todoListId = 1;
    const validItemId = 1;
    const invalidItemId = 2;
    const description = 'Item description';
    const newDescription = 'New Item description';
    
    beforeAll(async () => {
      token1 = await utils.registerUser({ email: email1, password: password1 });
      token2 = await utils.registerUser({ email: email2, password: password2 });
      await db.insertTodoList({ title: 'TodoList 1', todos: [], uid: 1 });
      await db.insertItem({ description, todo_list_id: 1 });
    });
    
    it('should return status code 400 if item does not exist', async () => {
      return request(app)
        .patch(`/item/${invalidItemId}`)
        .set('authorization', `Bearer ${token1}`)
        .send({ description: newDescription, todo_list_id: todoListId })
        .expect(400)
        .then(response => {
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('description');
          expect(response.body).not.toHaveProperty('todo_list_id');
        });
    });
    
    it('should return status code 403 if account not in access list', async () => {
      return request(app)
        .patch(`/item/${validItemId}`)
        .set('authorization', `Bearer ${token2}`)
        .send({ description: newDescription, todo_list_id: todoListId })
        .expect(403)
        .then(response => {
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('description');
          expect(response.body).not.toHaveProperty('todo_list_id');
        });
    });
    
    it('should return status code 200 and return updated item', async () => {
      return request(app)
        .patch(`/item/${validItemId}`)
        .set('authorization', `Bearer ${token1}`)
        .send({ description: newDescription, todo_list_id: todoListId })
        .expect(200)
        .then(response => {
          expect(response.body).toMatchObject(new Item({
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
  });
  
  describe('given uid, id', () => {
    let token1;
    let token2;
    const todoListId = 1;
    const validItemId = 1;
    const invalidItemId = 2;
    const description = 'Item description';
    
    beforeAll(async () => {
      token1 = await utils.registerUser({ email: email1, password: password1 });
      token2 = await utils.registerUser({ email: email2, password: password2 });
      await db.insertTodoList({ title: 'TodoList 1', todos: [], uid: 1 });
      await db.insertItem({ description, todo_list_id: 1 });
    });
    
    it('should return status code 400 if item does not exist', async () => {
      return request(app)
        .delete(`/item/${invalidItemId}`)
        .set('authorization', `Bearer ${token1}`)
        .expect(400)
        .then(response => {
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('description');
          expect(response.body).not.toHaveProperty('todo_list_id');
        });
    });
    
    it('should return status code 403 if account not in access list', async () => {
      return request(app)
        .delete(`/item/${validItemId}`)
        .set('authorization', `Bearer ${token2}`)
        .expect(403)
        .then(response => {
          expect(response.body).not.toHaveProperty('id');
          expect(response.body).not.toHaveProperty('description');
          expect(response.body).not.toHaveProperty('todo_list_id');
        });
    });
    
    it('should return status code 200 and return updated item', async () => {
      return request(app)
        .delete(`/item/${validItemId}`)
        .set('authorization', `Bearer ${token1}`)
        .expect(200)
        .then(response => {
          expect(response.body).toMatchObject(new Item({
            id: validItemId,
            description,
            todo_list_id: todoListId
          }));
        });
    });
  });
});