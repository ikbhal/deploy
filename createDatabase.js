const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the database');
});

db.run(`
    CREATE TABLE IF NOT EXISTS scripts (
        id INTEGER PRIMARY KEY,
        name TEXT,
        body TEXT
    )
`, (err) => {
    if (err) {
        console.error('Error creating scripts table:', err.message);
    } else {
        console.log('Scripts table created');
    }
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed');
    }
});
