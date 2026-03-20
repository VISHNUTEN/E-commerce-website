const db = require('./database');
const fs = require('fs');
setTimeout(() => {
    db.all('SELECT * FROM products', [], (err, products) => {
        if (err) return console.error(err);
        let out = '--- PRODUCTS ---\n';
        products.forEach(p => out += `ID: ${p.id}, Name: ${p.name}, Price: ₹${p.price}\n`);

        db.all('SELECT * FROM users', [], (err, users) => {
            if (err) return console.error(err);
            out += '\n--- USERS ---\n';
            if (users.length === 0) {
                out += 'No users found.\n';
            }
            users.forEach(u => out += `ID: ${u.id}, Email: ${u.email} (Note: no name field exists for users)\n`);

            fs.writeFileSync('./db_output.txt', out);
            process.exit(0);
        });
    });
}, 500);
