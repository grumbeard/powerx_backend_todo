require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const bycrypt = require('bcrypt');
const AuthService = require('./auth');

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const email = 'john.doe@example.com';
const password = 'password';
const payload = { key: 'value' };

const MockDB = () => {
  const db = {};
  
  db.insertAccount = jest.fn(account => {
    return { id: 1, ...account }
  });
  
  db.findAccountByEmail = jest.fn(async () => {
    return {
      id: 1,
      email: email,
      password_hash: await bycrypt.hash(password, SALT_ROUNDS)
    }
  })
  
  return db;
}

const db = MockDB();
const authService = AuthService(db);

describe('Register user', () => {
  describe('given new email and password', () => {
    it('should return a valid token', async () => {
      // Mock DB to return false when checking if user exists
      db.findAccountByEmail.mockReturnValueOnce(false);
      const token = await authService.register({ email, password });
      expect(token).not.toBeFalsy();
      expect(authService.verifyToken(token)).toBeTruthy();
    });
    
    it('should return false if no account created', async () => {
      // Mock FB to return false when checking if user exists
      db.findAccountByEmail.mockReturnValueOnce(false);
      // Mock DB to return false when creating new user
      db.insertAccount.mockReturnValueOnce(false);
      const token = await authService.register({ email, password });
      expect(token).toBeFalsy();
    })
  });
  
  describe('given existing email', () => {
    it('should return false', async () => {
      const token = await authService.register({ email, password });
      expect(token).toBeFalsy();
    });
  });
});

describe('Login user', () => {
  describe('given non-registered email', () => {
    it('should return false', async () => {
      // Mock DB to return false when checking if user exists
      db.findAccountByEmail.mockReturnValueOnce(false);
      const token = await authService.login({ email, password });
      expect(token).toBeFalsy();
    });
  });
  
  describe('given registered email and password', () => {
    it('should return valid token', async () => {
      const token = await authService.login({ email, password });
      expect(token).not.toBeFalsy();
      expect(authService.verifyToken(token)).toBeTruthy();
    });
  });
  
  describe('given invalid password', () => {
    it('should return false', async () => {
      const token = await authService.login({ email, password: 'invalid' });
      expect(token).toBeFalsy();
    });
  });
});

describe('Generate/Verify Token', () => {
  describe('given payload', () => {
    it('should generate token that returns payload when verified', () => {
      const token = authService.createToken(payload);
      const payloadFromToken = authService.verifyToken(token);
      expect(payloadFromToken.key).toEqual(payload.key);
    });
  });
  
  describe('given invalid token', () => {
    it('should throw errors', () => {
      const token = authService.createToken(payload);
      
      // Modify signature portion of token
      const invalidToken1 = token.concat('a');
      expect(() => authService.verifyToken(invalidToken1)).toThrowError('invalid signature');
      
      // Modify header portion of token
      const invalidToken2 = token.substring(1);
      expect(() => authService.verifyToken(invalidToken2)).toThrowError('invalid token');
    });
  });
});