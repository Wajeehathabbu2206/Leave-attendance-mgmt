import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), ".env"),
});

const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be configured",
    );
  }

  const email = ADMIN_EMAIL.toLowerCase().trim();
  const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const existingUser = await User.findOne({ email });

  if (existingUser && existingUser.role !== "admin") {
    throw new Error(
      `The configured admin email belongs to a ${existingUser.role} account`,
    );
  }

  const admin = existingUser || (await User.findOne({ role: "admin" }));
  if (admin) {
    admin.name = ADMIN_NAME;
    admin.email = email;
    admin.password = password;
    admin.role = "admin";
    await admin.save();
    console.log(`Admin account synchronized for ${email}`);
    return;
  }

  await User.create({ name: ADMIN_NAME, email, password, role: "admin" });
  console.log(`Admin account created for ${email}`);
};

try {
  await connectDB();
  await seedAdmin();
} catch (error) {
  console.error(`Admin seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
