require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ketNoiMongoDB } = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');

const app = express();
const PORT = process.env.PORT || 4000;
const originList = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((item) => item.trim()) : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || originList.includes('*') || originList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Logistics QR Backend is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);

app.use((err, _req, res, _next) => {
  console.error('[Server] Lỗi middleware:', err.message);
  res.status(500).json({ success: false, message: 'Lỗi server nội bộ.' });
});

const startServer = async () => {
  try {
    await ketNoiMongoDB();
    app.listen(PORT, () => {
      console.log(`[Server] Backend server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Khởi động thất bại:', err.message);
    process.exit(1);
  }
};

startServer();
