const request = require('supertest');
const { utils } = require('./utils');

const app = utils.app;
const db = utils.db;

const email = 'john.doe@example.com';
const password = 'password';


beforeAll(async () => {
  // Set up database
  await utils.setup();
});

afterAll(async () => {
  // Tear down database
  await utils.teardown();
});

describe('POST /login', () => {
  beforeAll(async () => {
    await db.clearAccountTable();
    await utils.registerUser({ email, password });
  });
  
  describe('given an email and password', () => {
    it('should respond with status code 200 and return a token', async () => {
      return request(app)
        .post('/login')
        .send({ email, password })
        .expect(200)
        .then(response => {
          expect(response.body.token).toBeTruthy()
        });
    });
  });
});

describe('POST /register', () => {
  beforeAll(async () => {
    await db.clearAccountTable();
  });
  
  describe('given an email and password', () => {
    it('should respond with status code 200 and return a token', async () => {
      return request(app)
        .post('/register')
        .send({ email, password })
        .expect(201)
        .then(response => {
          expect(response.body.token).toBeTruthy()
        });
    });
    
    it('should respond with status code 401 if email already exists', async () => {
      return request(app)
        .post('/register')
        .send({ email, password })
        .expect(401)
        .then(response => {
          expect(response.body.token).toBeFalsy()
        });
    });
  });
});