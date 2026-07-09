import 'dotenv/config';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Creates a default admin account if one does not already exist.
 * Run with: npm run seed
 */
const seed = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log(`Admin user already exists: ${adminEmail}`);
  } else {
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
