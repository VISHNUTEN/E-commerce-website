const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 2 & 3: Use PostgreSQL with process.env.DATABASE_URL & Enable SSL for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_vibe_store_key_in_prod_use_env';

module.exports = async function handler(req, res) {
    // Handle CORS for Vercel Serverless
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 4: Handle POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Ensure users table exists just in case
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5: Insert into users table
        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
            [email, hashedPassword]
        );

        const newUserId = result.rows[0].id;
        const token = jwt.sign({ id: newUserId, email }, JWT_SECRET, { expiresIn: '24h' });

        // 6: Return proper success response
        return res.status(200).json({ token, user: { id: newUserId, email } });

    } catch (err) {
        // 7: Add error logging to identify the issue in Vercel Logs
        console.error("SIGNUP ERROR:", err);

        // 6: Return proper error response
        if (err.code === '23505') { // Postgres unique violation (duplicate email)
            return res.status(400).json({ error: "Email already exists" });
        }

        return res.status(500).json({ 
            error: "DB Error: " + err.message, 
            details: err.message 
        });
    }
};
