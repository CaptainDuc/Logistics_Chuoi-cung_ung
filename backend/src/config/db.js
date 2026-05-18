const mongoose = require("mongoose");
const dns = require("dns");

// Ép Node.js tự dùng DNS của Google để phân giải hệ thống đám mây, bỏ qua lỗi Windows Cache
dns.setServers(["8.8.8.8", "8.8.4.4"]);

async function ketNoiMongoDB() {
  try {
    console.log("[DB] Đang tiến hành kết nối đến MongoDB...");
    const uri = process.env.MONGO_URI;
    console.log(`[DB] URI: ${uri}`);

    const cauHinhKetNoi = {
      serverSelectionTimeoutMS: 15000, // Tăng thời gian chờ lên 15 giây để kịp bắt IP động 4G
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(uri, cauHinhKetNoi);

    const tenDatabase = mongoose.connection.name;
    console.log(
      `[DB]  Kết nối MongoDB thành công! Database: "${tenDatabase}"`,
    );
  } catch (err) {
    console.error("[DB]  Kết nối MongoDB THẤT BẠI!");
    console.error(`[DB] Lỗi chi tiết: ${err.message}`);
    throw new Error(`Không thể kết nối MongoDB: ${err.message}`);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("[DB]  Mongoose đã bị NGẮT KẾT NỐI khỏi MongoDB.");
});

module.exports = {
  ketNoiMongoDB,
  mongoose,
};
