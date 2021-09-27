const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

module.exports = () => {
  const db = {
    ...require('./todo-list')(pool)
  }
  
  db.initialize = async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS TodoList (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        todos VARCHAR(100) ARRAY
      )
    `);
  };
  
  db.end = async () => {
    await pool.end();
  }
  
  return db;
}