const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(express.json());


const db = new sqlite3.Database('./products.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the products database.');
});


db.run(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock_quantity INTEGER NOT NULL
    )
`);


app.post('/add_product', (req, res) => {
    const { name, price, stock_quantity } = req.body;

    if (!name || !price || !stock_quantity) {
        return res.status(400).json({ error: 'Invalid input, all fields are required' });
    }

    if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
    }

    if (!Number.isInteger(stock_quantity) || stock_quantity < 0) {
        return res.status(400).json({ error: 'Stock quantity must be a non-negative integer' });
    }

    const sql = `INSERT INTO products (name, price, stock_quantity) VALUES (?, ?, ?)`;
    db.run(sql, [name, price, stock_quantity], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Product added successfully', id: this.lastID });
    });
});

app.get('/get_products', (req, res) => {
    const sql = `SELECT * FROM products ORDER BY price`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
