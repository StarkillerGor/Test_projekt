require('dotenv').config({ path: 'dataadr.env' });

const mysql = require('mysql2');

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;


const db = mysql.createConnection({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName
});
db.connect((err) => {
  if (err) {
    console.error('DB error:', err);
    return;
  }
  console.log('Connected to MySQL');
});
module.exports = db;