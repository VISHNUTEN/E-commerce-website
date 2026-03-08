const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

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
        db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: "Email already exists" });
                }
                return res.status(500).json({ error: err.message });
            }
            const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, user: { id: this.lastID, email } });
        });
    } catch (err) {
        res.status(500).json({ error: "Server error during signup" });
    }
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email } });
    });
});


app.use(cors());
app.use(express.json());

// Get all products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Get a single product by ID
app.get('/api/products/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.json({ data: row });
    });
});

// Get cart items with product details (Protected)
app.get('/api/cart', authenticateToken, (req, res) => {
    const query = `
        SELECT cart.id as cart_id, cart.quantity, products.* 
        FROM cart 
        JOIN products ON cart.product_id = products.id
        WHERE cart.user_id = ?
    `;
    db.all(query, [req.user.id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Add item to cart (Protected)
app.post('/api/cart', authenticateToken, (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    const user_id = req.user.id;

    // Check if it already exists
    db.get('SELECT * FROM cart WHERE product_id = ? AND user_id = ?', [product_id, user_id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row) {
            // Update quantity
            db.run('UPDATE cart SET quantity = quantity + ? WHERE product_id = ? AND user_id = ?', [quantity, product_id, user_id], function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: "Cart updated", id: row.id, product_id, quantity: row.quantity + quantity });
            });
        } else {
            // Insert new item
            db.run('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [user_id, product_id, quantity], function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: "Added to cart", id: this.lastID, product_id, quantity });
            });
        }
    });
});

// Remove item from cart completely (Protected)
app.delete('/api/cart/:cart_id', authenticateToken, (req, res) => {
    db.run('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.cart_id, req.user.id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Removed from cart", changes: this.changes });
    });
});

// Clear cart (Checkout) (Protected)
app.post('/api/checkout', authenticateToken, (req, res) => {
    db.run('DELETE FROM cart WHERE user_id = ?', [req.user.id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Checkout successful, cart cleared" });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
