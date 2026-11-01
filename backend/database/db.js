const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'crime_system.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log(' Connected to SQLite database: crime_system.db');
  }
});

// Run Schema on startup
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql, (err) => {
  if (err) {
    console.error('Error executing schema.sql:', err.message);
  } else {
    console.log(' Database tables verified & schema ready.');
  }
});

module.exports = db;