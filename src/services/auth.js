const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;
const JWT_ALGORITHM = process.env.JWT_ALGORITHM;

module.exports = (db) => {
  const service = {};
  
  service.login = async ({ email, password }) => {
    const account = await db.findAccountByEmail(email);
    if (account) {
      // Check if password valid
      const isPasswordValid = await service.checkPassword(
        password,
        account.password_hash
      );
      if (isPasswordValid) {
        // Generate token
        const token = service.createToken({ uid: account.id });
        return token;
      }
    }
  }
  
  service.register = async ({ email, password }) => {
    // Check if email already in use
    const existingaccount = await db.findAccountByEmail(email);
    if (existingaccount) return null;

    // If email in use, create new account with hashed password
    const passwordHash = await service.hashPassword(password);
    const account = await db.insertAccount({
      email,
      password_hash: passwordHash
    });
    
    if (account) {
      // Generate token
      const token = service.createToken({ uid: account.id });
      return token;
    }
  }
  
  service.checkPassword = (password, hash) =>
    bycrypt.compare(password, hash);
    
  service.createToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: JWT_ALGORITHM
    });
  }
    
  service.hashPassword = (password) =>
    bycrypt.hash(password, SALT_ROUNDS);
    
  service.verifyToken = (token) =>
    jwt.verify(token, JWT_SECRET);
  
  return service;
}