const { Account } = require('../models/account');

module.exports = (pool) => {
  const db = {};
  
  db.insertAccount = async ({email, password_hash}) => {
    const res = await pool.query('INSERT INTO Account (email, password_hash) VALUES ($1, $2) RETURNING *', [email, password_hash]);
    return res.rowCount ? new Account(res.rows[0]) : null;
  };
  
  db.findAccountByEmail = async (email) => {
    const res = await pool.query('SELECT * FROM Account WHERE email = $1', [email]);
    return res.rowCount ? new Account(res.rows[0]) : null;
  };
  
  return db;
}