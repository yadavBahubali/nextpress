const bcrypt = require('bcrypt');
const db = require('../config/db');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME || 'Admin User';
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const role_id = 1; // Assuming 1 is the Super Admin role

    // No hardcoded default credentials: a known email/password shipping to
    // production is exactly how a site gets taken over. Require both to be
    // set explicitly for every run instead.
    if (!email || !password) {
      console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script, e.g.:');
      console.error('  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD="a strong password" npm run seed:admin');
      process.exit(1);
    }
    if (password.length < 12) {
      console.error('ADMIN_PASSWORD must be at least 12 characters.');
      process.exit(1);
    }

    // Check if admin already exists
    const existing = await db.select('users', '*', `email = ?`, [email]);

    if (existing) {
      console.log('Admin user with this email already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.insert('users', {
      name,
      email,
      password_hash: hashedPassword,
      role_id
    });

    console.log('Admin user seeded successfully!');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    process.exit(0);
  }
};

seedAdmin();
