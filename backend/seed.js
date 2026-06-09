/**
 * Script khởi tạo dữ liệu mẫu (seed data) cho hệ thống quản lý kho hàng.
 * Chạy: node seed.js
 *
 * LƯU Ý: Script này XÓA toàn bộ dữ liệu cũ trong 4 collections trước khi nạp mới.
 * Chỉ chạy trong môi trường phát triển hoặc khi cần reset database.
 */
require("dotenv").config();

const User = require("./src/models/User");
const Product = require("./src/models/Product");
const Supplier = require("./src/models/Supplier");
const InventoryLog = require("./src/models/InventoryLog");
const { ketNoiMongoDB, mongoose } = require("./src/config/db");
const bcrypt = require("bcryptjs");

async function chaySeedDuLieu() {
  try {
    console.log("\n============================================");
    console.log("         SEED DATA - BẮT ĐẦU               ");
    console.log("============================================\n");

    await ketNoiMongoDB();

    console.log("[SEED] Đang xóa dữ liệu cũ trong các collections...");
    await InventoryLog.deleteMany({});
    await Product.deleteMany({});
    await Supplier.deleteMany({});
    await User.deleteMany({});
    console.log("[SEED] Đã xóa sạch dữ liệu cũ.\n");

    // Tạo 3 tài khoản người dùng
    console.log("[SEED] Đang tạo tài khoản người dùng...");
    const matKhauDaMaHoa = await bcrypt.hash("123456", 10);

    const taiKhoanAdmin = await User.create({
      username: "admin",
      password: matKhauDaMaHoa,
      role: "Admin",
    });
    console.log(
      `[SEED]   - Admin: username="admin", password="123456", role="Admin"`,
    );

    const taiKhoanStaff = await User.create({
      username: "staff",
      password: matKhauDaMaHoa,
      role: "User",
    });
    console.log(
      `[SEED]   - Staff: username="staff", password="123456", role="User"`,
    );

    const taiKhoanKho = await User.create({
      username: "kho01",
      password: matKhauDaMaHoa,
      role: "User",
    });
    console.log(
      `[SEED]   - Nhân viên kho: username="kho01", password="123456", role="User"`,
    );
    console.log("[SEED] Đã tạo xong tài khoản người dùng.\n");

    // Tạo 3 nhà cung cấp
    console.log("[SEED] Đang tạo nhà cung cấp...");
    const nhaCungCap1 = await Supplier.create({
      name: "Công Ty TNHH Vật Tư ABC",
      contactName: "Nguyễn Văn An",
      email: "an.nv@vatutuabc.com",
      phone: "0909123456",
    });
    console.log(
      `[SEED]   - NCC 1: "${nhaCungCap1.name}" (ID: ${nhaCungCap1._id})`,
    );

    const nhaCungCap2 = await Supplier.create({
      name: "Công Ty CP Thương Mại XYZ",
      contactName: "Trần Thị Bình",
      email: "binh.tt@thuongmaixyz.vn",
      phone: "0918234567",
    });
    console.log(
      `[SEED]   - NCC 2: "${nhaCungCap2.name}" (ID: ${nhaCungCap2._id})`,
    );

    const nhaCungCap3 = await Supplier.create({
      name: "Tổng Kho Linh Kiện Số Toàn Cầu",
      contactName: "Phạm Hồng Minh",
      email: "minh.ph@linhkienso.com",
      phone: "0933456789",
    });
    console.log(
      `[SEED]   - NCC 3: "${nhaCungCap3.name}" (ID: ${nhaCungCap3._id})`,
    );
    console.log("[SEED] Đã tạo xong nhà cung cấp.\n");

    // Tạo 6 sản phẩm
    console.log("[SEED] Đang tạo sản phẩm...");
    const sanPham1 = await Product.create({
      name: "Máy tính xách tay Dell XPS 13",
      sku: "LAP-DELL-XPS13-001",
      quantity: 0,
      minQuantity: 5,
      supplierId: nhaCungCap1._id,
      location: "Kệ A1 - Tầng 1",
    });
    console.log(`[SEED]   - SP1: "${sanPham1.name}" (SKU: ${sanPham1.sku})`);

    const sanPham2 = await Product.create({
      name: "Chuột không dây Logitech MX Master 3S",
      sku: "MOU-LOGI-MX3S-002",
      quantity: 0,
      minQuantity: 20,
      supplierId: nhaCungCap1._id,
      location: "Kệ B3 - Tầng 1",
    });
    console.log(`[SEED]   - SP2: "${sanPham2.name}" (SKU: ${sanPham2.sku})`);

    const sanPham3 = await Product.create({
      name: "Bàn phím cơ Keychron K8 Pro",
      sku: "KEY-KEYC-K8P-003",
      quantity: 0,
      minQuantity: 10,
      supplierId: nhaCungCap2._id,
      location: "Kệ C2 - Tầng 2",
    });
    console.log(`[SEED]   - SP3: "${sanPham3.name}" (SKU: ${sanPham3.sku})`);

    const sanPham4 = await Product.create({
      name: "Tai nghe chống ồn Sony WH-1000XM5",
      sku: "EAR-SONY-XM5-004",
      quantity: 0,
      minQuantity: 8,
      supplierId: nhaCungCap2._id,
      location: "Kệ C4 - Tầng 2",
    });
    console.log(`[SEED]   - SP4: "${sanPham4.name}" (SKU: ${sanPham4.sku})`);

    const sanPham5 = await Product.create({
      name: "Bộ định tuyến Wi-Fi 6 ASUS RT-AX88U",
      sku: "NET-ASUS-AX88U-005",
      quantity: 0,
      minQuantity: 15,
      supplierId: nhaCungCap3._id,
      location: "Kệ D1 - Tầng 3",
    });
    console.log(`[SEED]   - SP5: "${sanPham5.name}" (SKU: ${sanPham5.sku})`);

    const sanPham6 = await Product.create({
      name: "Ổ cứng SSD Samsung 990 Pro 1TB",
      sku: "SSD-SAMS-990P-006",
      quantity: 0,
      minQuantity: 30,
      supplierId: nhaCungCap3._id,
      location: "Kệ E2 - Tầng 1",
    });
    console.log(`[SEED]   - SP6: "${sanPham6.name}" (SKU: ${sanPham6.sku})`);
    console.log("[SEED] Đã tạo xong sản phẩm.\n");

    // Tạo các lịch sử biến động kho hàng (Nhập / Xuất)
    console.log("[SEED] Đang tạo log nhập/xuất kho...");

    await InventoryLog.create({
      productId: sanPham1._id,
      userId: taiKhoanAdmin._id,
      type: "Import",
      quantity: 25,
    });
    await InventoryLog.create({
      productId: sanPham2._id,
      userId: taiKhoanAdmin._id,
      type: "Import",
      quantity: 60,
    });
    await InventoryLog.create({
      productId: sanPham3._id,
      userId: taiKhoanStaff._id,
      type: "Import",
      quantity: 40,
    });
    await InventoryLog.create({
      productId: sanPham4._id,
      userId: taiKhoanKho._id,
      type: "Import",
      quantity: 15,
    });
    await InventoryLog.create({
      productId: sanPham5._id,
      userId: taiKhoanKho._id,
      type: "Import",
      quantity: 30,
    });
    await InventoryLog.create({
      productId: sanPham6._id,
      userId: taiKhoanAdmin._id,
      type: "Import",
      quantity: 12,
    });

    await InventoryLog.create({
      productId: sanPham1._id,
      userId: taiKhoanStaff._id,
      type: "Export",
      quantity: 5,
    });
    await InventoryLog.create({
      productId: sanPham2._id,
      userId: taiKhoanKho._id,
      type: "Export",
      quantity: 10,
    });
    await InventoryLog.create({
      productId: sanPham3._id,
      userId: taiKhoanKho._id,
      type: "Export",
      quantity: 15,
    });

    console.log("[SEED] Đã tạo xong hệ thống log biến động.\n");

    console.log("[SEED] Đang đồng bộ số lượng sản phẩm tồn kho thực tế...");
    await Product.findByIdAndUpdate(sanPham1._id, { quantity: 20 });
    await Product.findByIdAndUpdate(sanPham2._id, { quantity: 50 });
    await Product.findByIdAndUpdate(sanPham3._id, { quantity: 25 });
    await Product.findByIdAndUpdate(sanPham4._id, { quantity: 15 });
    await Product.findByIdAndUpdate(sanPham5._id, { quantity: 30 });
    await Product.findByIdAndUpdate(sanPham6._id, { quantity: 12 });
    console.log("[SEED] Đã cập nhật số lượng tồn kho cho các sản phẩm.\n");

    await mongoose.connection.close();
    console.log("[SEED] Đã ngắt kết nối MongoDB.\n");

    console.log("============================================");
    console.log("          SEED DATA - HOÀN TẤT             ");
    console.log("============================================");
    console.log("Tài khoản đăng nhập hệ thống:");
    console.log(
      '  1. Admin:  username="admin",  password="123456", role="Admin"',
    );
    console.log('  2. Staff:  username="staff",  password="123456", role="User"');
    console.log(
      '  3. Thủ kho: username="kho01", password="123456", role="User"',
    );
    console.log("============================================\n");

  } catch (err) {
    console.error("\n[SEED]  Đã xảy ra lỗi trong quá trình seed dữ liệu!");
    console.error(`[SEED] Lỗi: ${err.message}`);

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

if (require.main === module) {
  chaySeedDuLieu();
}
