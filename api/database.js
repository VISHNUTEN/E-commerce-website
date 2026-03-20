const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.VERCEL ? '/tmp/ecommerce.db' : path.resolve(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            // Create Products Table
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                description TEXT,
                image TEXT
            )`);

            // Create Cart Table
            db.run(`CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                product_id INTEGER,
                quantity INTEGER DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )`);

            // Create Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )`);

            // Seed Products if empty
            db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
                if (err) return console.error(err.message);
                if (row.count === 0) {
                    const insert = db.prepare(`INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)`);
                    const productsList = [
                        { name: "AeroGlow Pro Headphones", price: 299.99, description: "Active noise-cancelling overhead headphones with pristine audio quality.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop" },
                        { name: "Zenith Watch Ultra", price: 349.00, description: "Next-gen smartwatch with fitness tracking and 7-day battery life.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop" },
                        { name: "Lumix Flex Camera", price: 899.50, description: "Compact mirrorless camera for breathtaking photography.", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop" },
                        { name: "Nova Keyboard Mechanical", price: 149.00, description: "RGB mechanical keyboard with tactile switches.", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop" },
                        { name: "Echo Minimalist Lamp", price: 79.99, description: "Smart LED desk lamp with adjustable color temperature.", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop" },
                        { name: "Orbit Wireless Charger", price: 49.99, description: "Fast-charging pad compatible with all Qi-enabled devices.", image: "https://images.unsplash.com/photo-1541560052-5e137f229371?q=80&w=800&auto=format&fit=crop" }
                    ];
                    productsList.forEach(p => {
                        insert.run(p.name, p.price, p.description, p.image);
                    });
                    insert.finalize();
                    console.log('Seeded database with initial products.');
                }
            });
        });
    }
});

module.exports = db;
