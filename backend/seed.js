/**
 * SEED DATA — WHFlow Nexus Pro
 * Chay: cd backend && node seed.js
 * Xoa toan bo du lieu cu truoc khi nap moi.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");
const Product = require("./src/models/Product");
const Supplier = require("./src/models/Supplier");
const Customer = require("./src/models/Customer"); // <-- THÊM MODEL KHÁCH HÀNG
const InventoryLog = require("./src/models/InventoryLog");
const { ketNoiMongoDB } = require("./src/config/db");

async function seed() {
  console.log("[WHFlow] SEED - BAT DAU");
  await ketNoiMongoDB();

  console.log("[1/5] Xoa du lieu cu...");
  await InventoryLog.deleteMany({});
  await Product.deleteMany({});
  await Supplier.deleteMany({});
  await Customer.deleteMany({}); // <-- DỌN SẠCH KHÁCH HÀNG CŨ
  await User.deleteMany({});

  console.log("[2/5] Tao tai khoan...");
  const mk = await bcrypt.hash("123456", 10);
  const adminUser = await User.create({
    username: "ducthinh",
    password: mk,
    email: "ducthinhn@gmail.com",
    role: "Admin",
    isActive: true,
  });
  const staff1 = await User.create({
    username: "nvkho_tuan",
    password: mk,
    email: "tuan.nvkho@gmail.com",
    role: "User",
    isActive: true,
  });
  const staff2 = await User.create({
    username: "nvkho_huong",
    password: mk,
    email: "huong.nvkho@gmail.com",
    role: "User",
    isActive: true,
  });
  await User.create({
    username: "nv_nghisv",
    password: mk,
    role: "User",
    isActive: false,
  });
  console.log("  TK: ducthinh / 123456 (Admin)");
  console.log("  TK: nvkho_tuan / 123456 (User)");
  console.log("  TK: nvkho_huong / 123456 (User)");
  console.log("  TK: nv_nghisv / 123456 (User - bi khoa)");

  console.log("[3/5] Tao nha cung cap va khach hang...");
  // 3.1 Khởi tạo Nhà cung cấp (Đầu vào)
  const ncc1 = await Supplier.create({
    name: "Cong Ty TNHH Vat Tu Ky Thuat ABC",
    contactName: "Nguyen Van An",
    email: "an.nv@vatutuabc.com",
    phone: "0909 123 456",
  });
  const ncc2 = await Supplier.create({
    name: "Cong Ty CP Thuong Mai CN XYZ",
    contactName: "Tran Thi Binh",
    email: "binh.tt@thuongmaixyz.vn",
    phone: "0918 234 567",
  });
  const ncc3 = await Supplier.create({
    name: "Tong Kho Linh Kien So Toan Cau",
    contactName: "Pham Hong Minh",
    email: "minh.ph@linhkienso.com",
    phone: "0933 456 789",
  });
  const ncc4 = await Supplier.create({
    name: "Vien Thong Dien Tu Nam Phat",
    contactName: "Le Hoang Nam",
    email: "nam.lh@viendientunamphat.vn",
    phone: "028 3812 3456",
  });

  // 3.2 Khởi tạo danh mục Khách hàng / Đại lý mẫu (Đầu ra)
  const kh1 = await Customer.create({
    name: "Dai Ly Do Cong Nghe Hoan Kiem",
    contactName: "Anh Long",
    phone: "0944 555 666",
    address: "12 Hang Dao, Hoan Kiem, Ha Noi",
  });
  const kh2 = await Customer.create({
    name: "Chuoi Cua Hang Dien May Binh Thanh",
    contactName: "Chi Dung",
    phone: "0966 777 888",
    address: "45 D2, Phuong 25, Binh Thanh, TP.HCM",
  });
  const kh3 = await Customer.create({
    name: "Cong Ty Giao Duc Quoc Te PTIT Link",
    contactName: "Thay Son",
    phone: "0988 999 111",
    address: "Km10 Nguyen Trai, Ha Dong, Ha Noi",
  });
  const khs = [kh1, kh2, kh3];
  console.log("  4 Nha cung cap va 3 Khach hang dai ly da duoc khoi tao");

  console.log("[4/5] Tao 18 san pham...");
  const sp = [];
  const products = [
    [
      "May tinh xach tay Dell XPS 13 Plus 9320",
      "LAP-DELL-XP13P-001",
      25,
      5,
      ncc1,
      "Ke A1 - Tang 1 - Khu A",
    ],
    [
      'May tinh xach tay MacBook Air M2 13"',
      "LAP-APPL-MBA2-002",
      15,
      3,
      ncc2,
      "Ke A2 - Tang 1 - Khu A",
    ],
    [
      "Chuot khong day Logitech MX Master 3S",
      "MOU-LOGI-MX3S-003",
      48,
      20,
      ncc1,
      "Ke B3 - Tang 1 - Khu B",
    ],
    [
      "Chuot gaming Razer DeathAdder V3 Pro",
      "MOU-RAZR-DAV3-004",
      12,
      15,
      ncc2,
      "Ke B4 - Tang 1 - Khu B",
    ],
    [
      "Ban phim co Keychron K8 Pro",
      "KEY-KEYC-K8P-005",
      32,
      10,
      ncc1,
      "Ke C2 - Tang 2 - Khu C",
    ],
    [
      "Ban phim co Corsair K70 RGB Pro",
      "KEY-CORS-K70P-006",
      8,
      10,
      ncc2,
      "Ke C3 - Tang 2 - Khu C",
    ],
    [
      'Man hinh LG UltraGear 27" 4K IPS',
      "MON-LG-27U60-007",
      20,
      5,
      ncc3,
      "Ke D1 - Tang 2 - Khu D",
    ],
    [
      'Man hinh Samsung Odyssey G7 32" Curved',
      "MON-SAMS-G732-008",
      7,
      3,
      ncc3,
      "Ke D2 - Tang 2 - Khu D",
    ],
    [
      "Tai nghe chong on Sony WH-1000XM5",
      "EAR-SONY-XM5-009",
      18,
      8,
      ncc2,
      "Ke E1 - Tang 2 - Khu E",
    ],
    [
      "Tai nghe AirPods Pro 2 USB-C",
      "EAR-APPL-APP2-010",
      30,
      10,
      ncc2,
      "Ke E2 - Tang 2 - Khu E",
    ],
    [
      "Webcam Logitech Brio 4K Pro",
      "CAM-LOGI-BRIO-011",
      22,
      10,
      ncc4,
      "Ke F1 - Tang 3 - Khu F",
    ],
    [
      "Webcam Razer Kiyo Pro Ultra 4K",
      "CAM-RAZR-KYU-012",
      9,
      5,
      ncc4,
      "Ke F2 - Tang 3 - Khu F",
    ],
    [
      "Bo dinh tuyen Wi-Fi 6 ASUS RT-AX88U",
      "NET-ASUS-AX88-013",
      35,
      15,
      ncc3,
      "Ke G1 - Tang 3 - Khu G",
    ],
    [
      "Switch TP-Link 24-Port PoE+ JetStream",
      "NET-TPLI-POE24-014",
      14,
      5,
      ncc4,
      "Ke G2 - Tang 3 - Khu G",
    ],
    [
      "O cung SSD Samsung 990 Pro 1TB NVMe",
      "SSD-SAMS-990P-015",
      55,
      30,
      ncc3,
      "Ke H1 - Tang 3 - Khu H",
    ],
    [
      "O cung HDD Western Purple 4TB NAS",
      "HDD-WD-PURP-016",
      18,
      10,
      ncc3,
      "Ke H2 - Tang 3 - Khu H",
    ],
    [
      "Dock USB-C CalDigit TS4 Thunderbolt 4",
      "DOC-CALD-TS4-017",
      6,
      5,
      ncc2,
      "Ke I1 - Tang 4 - Khu I",
    ],
    [
      "Hub USB 3.0 7-Port Anker AM-CF0f",
      "HUB-ANKE-A7U3-018",
      40,
      20,
      ncc1,
      "Ke I2 - Tang 4 - Khu I",
    ],
  ];
  for (const [name, sku, qty, min, supplier, loc] of products) {
    const p = await Product.create({
      name,
      sku,
      quantity: qty,
      minQuantity: min,
      supplierId: supplier._id,
      location: loc,
    });
    sp.push(p);
  }
  console.log("  18 san pham tao xong");

  console.log("[5/5] Tao nhap/xuat kho...");
  const rand = () => [adminUser, staff1, staff2][Math.floor(Math.random() * 3)];

  // Tạo log Nhập kho (Chỉ NCC cung cấp nên customerId và customerName để mặc định)
  for (const p of sp) {
    await InventoryLog.create({
      productId: p._id,
      userId: rand()._id,
      type: "Import",
      quantity: Math.floor(Math.random() * 30) + 5,
    });
  }

  // Tạo log Xuất kho (Gán ngẫu nhiên một Khách hàng/Đại lý đại diện)
  const expIdx = [0, 2, 3, 5, 7, 8, 10, 12, 14, 16, 17];
  for (const i of expIdx) {
    const khachHangNhan = khs[Math.floor(Math.random() * khs.length)];
    await InventoryLog.create({
      productId: sp[i]._id,
      userId: rand()._id,
      type: "Export",
      quantity: Math.floor(Math.random() * 8) + 1,
      customerId: khachHangNhan._id,
      customerName: khachHangNhan.name,
    });
  }

  const imp = await InventoryLog.countDocuments({ type: "Import" });
  const exp = await InventoryLog.countDocuments({ type: "Export" });
  console.log("  " + imp + " phieu Nhap, " + exp + " phieu Xuat");

  await mongoose.connection.close();
  console.log("SEED HOAN TAN");
  console.log("18 SP | 4 NCC | 3 KH | " + imp + " nhap | " + exp + " xuat");
}

seed().catch((err) => {
  console.error("LOI: " + err.message);
  process.exit(1);
});
