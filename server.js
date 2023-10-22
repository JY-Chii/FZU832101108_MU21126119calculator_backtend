const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = new sqlite3.Database('./calculator.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the database.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS calculations (
      expression TEXT,
      result TEXT
    )
  `);
});

app.post('/calculate', (req, res) => {
  const expression = req.body.expression;
  try {
    const result = eval(expression); 
    db.run('INSERT INTO calculations (expression, result) VALUES (?, ?)', [expression, result]);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: 'Invalid expression' });
  }
});

app.get('/history', (req, res) => {
  db.all('SELECT * FROM calculations ORDER BY rowid DESC LIMIT 10', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
