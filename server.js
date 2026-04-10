const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));   // serve HTML/CSS/JS files

//  MEMBERS

// GET all members
app.get('/api/members', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, name, email, phone, grad_year, affiliation, created_at FROM members'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// POST — sign up / create member
app.post('/api/members', async (req, res) => {
    const { name, email, phone, year, address, password } = req.body;

    if (!name || !email || !year || !address || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO members (name, email, phone, grad_year, affiliation, password) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone || null, year, address, password]
        );
        res.status(201).json({ message: 'Member created', id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already registered' });
        }
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// POST — login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    try {
        const [rows] = await db.query(
            'SELECT id, name, email FROM members WHERE email = ? AND password = ?',
            [email, password]
        );
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.json({ message: 'Login successful', user: rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// DELETE member
app.delete('/api/members/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM members WHERE id = ?', [req.params.id]);
        res.json({ message: 'Member deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});


//  PRODUCTS (tutor listings)

// GET all products
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// GET single product
app.get('/api/products/:itemId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE item_id = ?', [req.params.itemId]);
        if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// POST — create product
app.post('/api/products', async (req, res) => {
    const { itemId, format, description, email, price, hours } = req.body;

    if (!itemId || !format || !email || !price) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        await db.query(
            'INSERT INTO products (item_id, name, description, email, price, hours) VALUES (?, ?, ?, ?, ?, ?)',
            [itemId, format, description || '', email, price, hours || null]
        );
        res.status(201).json({ message: 'Product created' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Item ID already exists' });
        }
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// PUT — update product
app.put('/api/products/:itemId', async (req, res) => {
    const { format, description, email, price, hours } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE products SET name = ?, description = ?, email = ?, price = ?, hours = ? WHERE item_id = ?',
            [format, description, email, price, hours, req.params.itemId]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product updated' });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// DELETE product
app.delete('/api/products/:itemId', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM products WHERE item_id = ?', [req.params.itemId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

//  BILLING

// GET all billing records
app.get('/api/billing', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM billing ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// POST — submit billing
//   studentName / fullName, studentEmail, paymentMethod.cardNumber, cartItems / tutorsRequested
app.post('/api/billing', async (req, res) => {
    const body          = req.body;
    const studentName   = body.studentName  || body.fullName;
    const studentEmail  = body.studentEmail;
    const paymentMethod = body.paymentMethod || {};
    const cartItems     = body.cartItems     || body.tutorsRequested || [];

    if (!studentName || !studentEmail || !paymentMethod.cardNumber) {
        return res.status(400).json({ message: 'Missing required billing fields' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO billing (student_name, student_email, payment_method, card_number, cart_items) VALUES (?, ?, ?, ?, ?)',
            [studentName, studentEmail, 'card', paymentMethod.cardNumber, JSON.stringify(cartItems)]
        );
        res.status(201).json({ message: 'Billing saved', id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// DELETE billing record
app.delete('/api/billing/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM billing WHERE id = ?', [req.params.id]);
        res.json({ message: 'Billing record deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

//  RETURNS

// GET all returns
app.get('/api/returns', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM returns ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// POST — submit return
app.post('/api/returns', async (req, res) => {
    const { productName, reason, condition } = req.body;

    if (!productName || !reason || !condition) {
        return res.status(400).json({ message: 'Missing required return fields' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO returns (product_name, reason, condition_) VALUES (?, ?, ?)',
            [productName, reason, condition]
        );
        res.status(201).json({ message: 'Return submitted', id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// PUT — update return status
app.put('/api/returns/:id', async (req, res) => {
    const { status } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE returns SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Return not found' });
        res.json({ message: 'Return status updated' });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// DELETE return
app.delete('/api/returns/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM returns WHERE id = ?', [req.params.id]);
        res.json({ message: 'Return deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

db.init().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running → http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
