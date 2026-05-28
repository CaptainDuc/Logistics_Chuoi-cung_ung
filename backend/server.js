/**
 * =========================================================
 * FILE CHẠY CHÍNH CỦA HỆ THỐNG QUẢN LÝ KHO HÀNG - PTIT
 * =========================================================
 *
 * File này thực hiện:
 * - Khởi tạo server Express.
 * - Kết nối MongoDB thông qua Mongoose.
 * - Cấu hình middleware CORS, JSON parser.
 * - Đăng ký tất cả các route API:
 *     /api/auth       → authRoutes       (Đăng nhập / Đăng xuất / Làm mới token)
 *     /api/products   → productRoutes   (CRUD Sản phẩm)
 *     /api/inventory  → inventoryRoutes (Quét mã QR / Lịch sử kho / Xuất Excel)
 * - Lắng nghe trên cổng từ biến môi trường (PORT).
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { ketNoiMongoDB } = require('./src/config/db');

// Import các router đã định tuyến.
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');

const app = express();

// =========================================================
// MIDDLEWARE CẤU HÌNH
// =========================================================

// Cho phép frontend (React / Vue / Angular) gọi API từ domain khác.
// Cấu hình origin linh hoạt: nếu có ALLOWED_ORIGINS trong .env thì dùng, không thì cho phép tất cả.
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Parse body dạng JSON khi client gửi request lên.
app.use(express.json({ limit: '10mb' }));

// Parse body dạng URL-encoded (ít dùng hơn nhưng vẫn hỗ trợ).
app.use(express.urlencoded({ extended: true }));

// Middleware log mỗi request vào console (tiện debug khi phát triển).
app.use((req, res, next) => {
  const thoiGian = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  console.log(`[${thoiGian}] ${req.method} ${req.originalUrl}`);
  next();
});

// =========================================================
// HEALTH CHECK
// =========================================================

// Endpoint kiểm tra server còn sống hay không.
// Dùng để frontend hoặc load balancer gọi, không cần xác thực.
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Hệ thống Quản lý Kho hàng PTIT đang hoạt động!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy.',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// =========================================================
// ĐĂNG KÝ ROUTES
// =========================================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);

// =========================================================
// XỬ LÝ ROUTE KHÔNG TỒN TẠI (404)
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route không tồn tại: ${req.method} ${req.originalUrl}`,
  });
});

// =========================================================
// XỬ LÝ LỖI SERVER TỔNG QUÁT (500)
// =========================================================

app.use((err, req, res, next) => {
  console.error('[Server] Lỗi không xử lý được:', err.message);
  if (err.stack) {
    console.error('[Server] Stack trace:', err.stack);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Đã xảy ra lỗi server nội bộ.',
  });
});

// =========================================================
// KHỞI CHẠY SERVER
// =========================================================

const PORT = process.env.PORT || 5000;

const khoiDongServer = async () => {
  try {
    console.log('========================================');
    console.log('   HỆ THỐNG QUẢN LÝ KHO HÀNG - PTIT    ');
    console.log('========================================\n');

    // Bước 1: Kết nối MongoDB.
    console.log('[Server] Đang kết nối MongoDB...');
    await ketNoiMongoDB();

    // Bước 2: Khởi động HTTP server.
    const server = app.listen(PORT, () => {
      console.log(`[Server] ✅ HTTP Server đang lắng nghe trên cổng: ${PORT}`);
      console.log(`[Server] 🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`[Server] 📡 Base API URL:  http://localhost:${PORT}/api`);
      console.log('\n========================================');
      console.log('   CÁC ENDPOINT API CHÍNH');
      console.log('========================================');
      console.log('  Auth:      POST /api/auth/login');
      console.log('            POST /api/auth/refresh-token');
      console.log('            POST /api/auth/logout');
      console.log('  Products:  GET    /api/products');
      console.log('            GET    /api/products/:id');
      console.log('            POST   /api/products');
      console.log('            PUT    /api/products/:id');
      console.log('            DELETE /api/products/:id  (Admin only)');
      console.log('  Inventory: POST   /api/inventory/scan');
      console.log('            GET    /api/inventory/logs');
      console.log('            GET    /api/inventory/export-excel  (Admin only)');
      console.log('========================================\n');
    });

    // Xử lý tắt server graceful (không bị treo khi Ctrl+C).
    const tatServer = async (signal) => {
      console.log(`\n[Server] 📛 Nhận tín hiệu ${signal}. Đang tắt server...`);
      server.close(async () => {
        console.log('[Server] ✅ HTTP Server đã đóng.');
        const mongoose = require('./src/config/db').mongoose;
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
          console.log('[Server] ✅ Kết nối MongoDB đã đóng.');
        }
        process.exit(0);
      });

      // Force quit sau 10s nếu chưa tắt được.
      setTimeout(() => {
        console.error('[Server] ❌ Không thể đóng gracefully. Force quit.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => tatServer('SIGTERM'));
    process.on('SIGINT', () => tatServer('SIGINT'));

  } catch (err) {
    console.error('[Server] ❌ KHÔNG THỂ KHỞI ĐỘNG SERVER!');
    console.error(`[Server] Lỗi: ${err.message}`);
    process.exit(1);
  }
};

khoiDongServer();