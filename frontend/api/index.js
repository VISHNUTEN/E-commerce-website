const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'supersecret_vibe_store_key_in_prod_use_env';

app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Forbidden" });
        req.user = user;
        next();
    });
};

// --- AUTHENTICATION ROUTES ---

// Signup
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', [email, hashedPassword]);
        const newUserId = result.rows[0].id;
        
        const token = jwt.sign({ id: newUserId, email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: newUserId, email } });
    } catch (err) {
        if (err.code === '23505') { // Postgres unique violation error code
            return res.status(400).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: "Server error during signup" });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json({ data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get cart items with product details (Protected)
app.get('/api/cart', authenticateToken, async (req, res) => {
    const query = `
        SELECT cart.id as cart_id, cart.quantity, products.* 
        FROM cart 
        JOIN products ON cart.product_id = products.id
        WHERE cart.user_id = $1
    `;
    try {
        const result = await pool.query(query, [req.user.id]);
        res.json({ data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add item to cart (Protected)
app.post('/api/cart', authenticateToken, async (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    const user_id = req.user.id;

    try {
        // Check if it already exists
        const checkResult = await pool.query('SELECT * FROM cart WHERE product_id = $1 AND user_id = $2', [product_id, user_id]);
        const row = checkResult.rows[0];

        if (row) {
            // Update quantity
            await pool.query('UPDATE cart SET quantity = quantity + $1 WHERE product_id = $2 AND user_id = $3', [quantity, product_id, user_id]);
            res.json({ message: "Cart updated", id: row.id, product_id, quantity: row.quantity + quantity });
        } else {
            // Insert new item
            const insertResult = await pool.query('INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id', [user_id, product_id, quantity]);
            res.json({ message: "Added to cart", id: insertResult.rows[0].id, product_id, quantity });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove item from cart completely (Protected)
app.delete('/api/cart/:cart_id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM cart WHERE id = $1 AND user_id = $2', [req.params.cart_id, req.user.id]);
        res.json({ message: "Removed from cart", changes: result.rowCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear cart (Checkout) (Protected)
app.post('/api/checkout', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
        res.json({ message: "Checkout successful, cart cleared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Allow local testing with node api/index.js
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
