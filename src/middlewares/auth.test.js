require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const { getMockReq, getMockRes } = require('@jest-mock/express');

const AuthMiddleware = require('./auth');

const invalidToken = 'someinvalidtoken';
const validToken = 'somevalidtoken';

const MockAuthService = () => {
  return {
    verifyToken: jest.fn((token) => {
      if (token === validToken) return { uid: 1 }
      const JsonWebTokenError = new Error();
      JsonWebTokenError.name = 'JsonWebTokenError';
      throw JsonWebTokenError;
    })
  }
}

const authService = MockAuthService();
const authMiddleware = AuthMiddleware(authService);

describe('Authentication Middleware', () => {
  let res;
  let next;
  
  beforeEach(() => {
    const mock = getMockRes();
    res = mock['res'];
    next = mock['next'];
  })
  
  describe('given request with no authentication headers', () => {
    it('should redirect with 401', async () => {
      const req = getMockReq();
      authMiddleware(req, res, next);
      
      expect(next).not.toBeCalled();
      expect(res.redirect).toBeCalledWith(401, '/');
    });
  });
  
  describe('given request with token in authentication headers', () => {
    it('should call next if token is valid', async () => {
      const req = getMockReq({
        headers: {
          authorization: `Bearer ${validToken}`
        }
      });
      authMiddleware(req, res, next);
      
      expect(next).toBeCalled();
      expect(res.redirect).not.toBeCalled();
    });
    
    it('should redirect with 401 if token is invalid', async () => {
      const req = getMockReq({
        headers: {
          authorization: `Bearer ${invalidToken}`
        }
      });
      authMiddleware(req, res, next);
      
      expect(next).not.toBeCalled();
      expect(authService.verifyToken).toThrow();
      expect(res.redirect).toBeCalledWith(401, '/');
    });
    
    it('should redirect with 401 if token does not contain uid in payload', async () => {
      // Mock VerifyToken to return payload without uid
      authService.verifyToken.mockImplementation((token) => {
        return { uid: undefined };
      });
      
      const req = getMockReq({
        headers: {
          authorization: `Bearer ${validToken}`
        }
      });
      authMiddleware(req, res, next);
      
      expect(next).not.toBeCalled();
      expect(res.redirect).toBeCalledWith(401, '/');
    });
  });
  
  describe('given request with no token in authentication headers', () => {
    it('should redirect with 401', async () => {
      const req = getMockReq({
        headers: {
          authorization: 'Bearer '
        }
      });
      authMiddleware(req, res, next);
      
      expect(next).not.toBeCalled();
      expect(res.redirect).toBeCalledWith(401, '/');
    });
  });
  
  describe('with unknown error occuring', () => {
    it('should call next with error', async () => {
      // Mock unknown error
      authService.verifyToken.mockImplementation(() => {
        throw new Error('Some Error')
      });
      
      const req = getMockReq({
        headers: {
          authorization: `Bearer ${validToken}`
        }
      });
      authMiddleware(req, res, next);
      
      expect(next).toBeCalledWith(expect.any(Error));
      expect(res.redirect).not.toBeCalled();
    });
  });
});