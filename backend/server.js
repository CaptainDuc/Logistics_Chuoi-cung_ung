require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { ketNoiMongoDB } = require("./src/config/db");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./src/config/swagger");

const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const inventoryRoutes = require("./src/routes/inventoryRoutes");
const userRoutes = require("./src/routes/userRoutes");

const app = express();

// =========================================================
// MIDDLEWARE CẤU HÌNH
// =========================================================

const allowedOrigins = [
  "https://webquanlykhohang.vercel.app",
  "https://webquanlykhohang-4iblszgw7-tranducduc620-5696s-projects.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép nếu không có origin (như Postman) hoặc origin nằm trong danh sách
    if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.log(`[CORS] Blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 204
}));

// Xử lý thủ công cho yêu cầu Pre-flight (OPTIONS)
app.options('*', cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const thoiGian = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  console.log(`[${thoiGian}] ${req.method} ${req.originalUrl}`);
  next();
});

// =========================================================
// HEALTH CHECK & ROUTES
// =========================================================

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Hệ thống Smart WMS đang hoạt động!" });
});

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({
      success: true,
      message: "Server is healthy.",
      uptime: Math.floor(process.uptime()),
    });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/users", userRoutes);

// =========================================================
// XỬ LÝ LỖI
// =========================================================

app.use((req, res) => {
  res
    .status(404)
    .json({
      success: false,
      message: `Route không tồn tại: ${req.method} ${req.originalUrl}`,
    });
});

app.use((err, req, res, next) => {
  console.error("[Server] Lỗi:", err.message);
  res
    .status(err.statusCode || 500)
    .json({ success: false, message: err.message || "Đã xảy ra lỗi server." });
});

// =========================================================
// KHỞI CHẠY SERVER (Dành cho Railway)
// =========================================================

const PORT = process.env.PORT || 5000;

const khoiDongServer = async () => {
  try {
    await ketNoiMongoDB();
    // Quan trọng: Thêm "0.0.0.0" để Railway bắt được traffic
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Server] ✅ Server đang chạy tại cổng: ${PORT}`);
    });

    const tatServer = async (signal) => {
      console.log(`\n[Server] 📛 Tắt server...`);
      server.close(async () => {
        const mongoose = require("./src/config/db").mongoose;
        if (mongoose) await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => tatServer("SIGTERM"));
    process.on("SIGINT", () => tatServer("SIGINT"));
  } catch (err) {
    console.error("❌ KHÔNG THỂ KHỞI ĐỘNG SERVER:", err.message);
    process.exit(1);
  }
};

khoiDongServer();
