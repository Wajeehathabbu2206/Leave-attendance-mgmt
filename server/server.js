import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './healthRoutes.js';
import adminRoutes from './routes/admin.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import studentRoutes from './routes/student.routes.js';
import parentRoutes from './routes/parent.routes.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const app = express();
const port = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);

connectDB().catch((error) => {
  console.error(`MongoDB connection failed: ${error.message}`);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
