const request = require('supertest');
const { utils } = require('./utils');

const app = utils.app;

beforeAll(async () => {
  await utils.setup();
});

afterAll(async () => {
  await utils.teardown();
});

describe('GET /', () => {
  it('should respond with status code 200', () => {
    return request(app)
      .get('/')
      .expect(200);
  });
});