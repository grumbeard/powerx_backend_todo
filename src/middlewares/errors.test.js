require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const { getMockRes } = require('@jest-mock/express');
const { handleError } = require('./errors');

describe('Test Error Handler Middleware', () => {
  const { res, clearMockRes } = getMockRes();
  let mockConsole;
  const clientSideError = new Error('Bad Request Error');
  clientSideError.status = 400;
  
  beforeAll(() => {
    // Avoid printing errors in console during test
    mockConsole = jest.spyOn(console, 'error').mockImplementation();
  });
  
  beforeEach(() => {
    clearMockRes();
  });
  
  afterAll(() => {
    mockConsole.mockRestore();
  });
  
  it('should display correct status code of error if present', () => {
    handleError(clientSideError, res);
    expect(res.status).toHaveBeenCalledWith(clientSideError.status);
  });
  
  it('should display default status code (500) if error status code not present', () => {
    handleError(new Error(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
  
  it('should respond with error containing message if present', () => {
    handleError(clientSideError, res);
    expect(res.send).toHaveBeenCalledWith(
      expect.stringContaining(JSON.stringify(clientSideError.message))
    );
  });
});