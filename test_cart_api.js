const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const JWT_SECRET = 'supersecret_vibe_store_key_in_prod_use_env';
const dbPath = path.resolve(__dirname, 'backend', 'ecommerce.db');
const db = new sqlite3.Database(dbPath);

async function test() {
    db.get('SELECT * FROM users LIMIT 1', (err, user) => {
        if (err || !user) {
            console.error("No user found", err);
            process.exit(1);
        }
        console.log("Testing with user:", user.email, "ID:", user.id);
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
        console.log("Generated Token:", token);

        // Simulate GET /api/cart
        const query = `
            SELECT cart.id as cart_id, cart.quantity, products.* 
            FROM cart 
            JOIN products ON cart.product_id = products.id
            WHERE cart.user_id = ?
        `;
        db.all(query, [user.id], (err, rows) => {
            if (err) {
                console.error("GET /api/cart Error:", err.message);
            } else {
                console.log("GET /api/cart Success, rows:", rows.length);
            }

            // Simulate POST /api/cart
            const product_id = 1;
            const quantity = 1;
            db.get('SELECT * FROM cart WHERE product_id = ? AND user_id = ?', [product_id, user.id], (err, row) => {
                if (err) {
                    console.error("POST /api/cart SELECT Error:", err.message);
                } else {
                    console.log("POST /api/cart SELECT Success, row found:", !!row);
                }
                process.exit(0);
            });
        });
    });
}

test();
