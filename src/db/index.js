const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

module.exports = () => {
  const db = {
    ...require('./todo-list')(pool),
    ...require('./item')(pool),
    ...require('./account')(pool)
  }
  
  db.initialize = async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Account (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        password_hash VARCHAR(100) NOT NULL
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS TodoList (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        access_list INTEGER ARRAY NOT NULL,
        owner_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() ,
        deleted_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT fk_owner
          FOREIGN KEY (owner_id)
            REFERENCES Account(id) ON DELETE CASCADE
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Item (
        id SERIAL PRIMARY KEY,
        description VARCHAR(100) NOT NULL,
        todo_list_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() ,
        deleted_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT fk_todo_list
          FOREIGN KEY (todo_list_id)
            REFERENCES TodoList(id) ON DELETE CASCADE
      )
    `);
  };
  
  db.dropTodoListTable = async () => {
    // console.log('Deleting TodoList Table and all Dependencies...');
    await pool.query('DROP TABLE IF EXISTS TodoList CASCADE');
  };
  
  db.clearTodoListTable = async () => {
    // console.log('Clearing TodoList Table and all Dependencies');
    await pool.query('TRUNCATE TABLE TodoList RESTART IDENTITY CASCADE');
  };
  
  db.dropItemTable = async () => {
    // console.log('Deleting Item Table and all Dependencies...');
    await pool.query('DROP TABLE IF EXISTS Item CASCADE');
  };
  
  db.clearItemTable = async () => {
    // console.log('Clearing Item Table and all Dependencies');
    await pool.query('TRUNCATE TABLE Item RESTART IDENTITY CASCADE');
  };
  
  db.dropAccountTable = async () => {
    // console.log('Deleting Account Table and all Dependencies...');
    await pool.query('DROP TABLE IF EXISTS Account CASCADE');
  };
  
  db.clearAccountTable = async () => {
    // console.log('Clearing Account Table and all Dependencies');
    await pool.query('TRUNCATE TABLE Account RESTART IDENTITY CASCADE');
  };
  
  db.drop = async () => {
    await db.dropItemTable();
    await db.dropTodoListTable();
    await db.dropAccountTable();
  };
  
  db.end = async () => {
    await pool.end();
  };
  
  return db;
};