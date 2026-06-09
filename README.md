# WHFlow Nexus Pro — Hệ Thống Quản Lý Kho

Hệ thống quản lý kho hàng hiện đại, theo dõi nhập/xuất hàng, quét QR, xuất báo cáo Excel và phân quyền người dùng.

---

## Tính năng chính

| Tính năng | Mô tả |
|---|---|
| **Quản lý sản phẩm** | CRUD đầy đủ — thêm, sửa, xóa, xem chi tiết sản phẩm theo SKU |
| **Quản lý kho** | Nhập kho / Xuất kho — tự động cập nhật tồn kho, cảnh báo sắp hết |
| **Quét QR/SKU** | Trang `/scan` dùng camera quét mã vạch, đối chiếu real-time với backend |
| **Nhật ký kho** | Lịch sử đầy đủ các phiên nhập/xuất, ai làm gì, lúc nào |
| **Quản lý người dùng** | Đăng nhập JWT, phân quyền Admin / User, khóa tài khoản |
| **Xuất báo cáo Excel** | Export danh sách sản phẩm / lịch sử kho ra `.xlsx` |
| **Responsive UI** | Giao diện dark-themed, hoạt động tốt trên desktop lẫn mobile |

---

## Cấu trúc thư mục

```
Logistics_Chuoi-cung_ung/
├── backend/                  # Node.js + Express + MongoDB (cổng 5000)
│   ├── seed.js              # Script seed dữ liệu mẫu
│   ├── server.js            # Entry point
│   └── src/
│       ├── config/           # db.js (MongoDB), swagger.js
│       ├── controllers/      # Logic nghiệp vụ
│       ├── middleware/       # auth, role guard
│       ├── models/           # User, Product, Supplier, InventoryLog
│       └── routes/           # /api/auth, /api/products, /api/inventory, /api/users
│
└── frontend/                # Next.js 15 App Router (cổng 3000)
    └── src/
        ├── app/
        │   ├── (auth)/login/     # Trang đăng nhập
        │   ├── dashboard/       # Trang chính (products, inbound, outbound, users)
        │   └── scan/            # Trang quét QR/SKU
        ├── components/         # UI dùng chung
        ├── lib/                # api.ts, authRole.ts
        └── store/              # Zustand stores
```

---

## Cách chạy

### 1. Chuẩn bị

- Node.js 18+
- MongoDB Atlas (hoặc MongoDB cục bộ)

### 2. Backend

```bash
cd backend
npm install

# Sao chép và chỉnh .env
#   MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, PORT=5000

npm start
# Backend chạy tại http://localhost:5000
```

### 3. Seed dữ liệu mẫu

```bash
cd backend
node seed.js
```

Script sẽ xóa toàn bộ dữ liệu cũ và nạp mới:

| Thực thể | Số lượng |
|---|---|
| Người dùng | 4 tài khoản |
| Nhà cung cấp | 4 công ty |
| Sản phẩm | 18 sản phẩm (8 danh mục, 9 khu kho A→I) |
| Nhật ký kho | ~29 phiếu nhập + ~11 phiếu xuất |

### 4. Frontend

```bash
cd frontend
npm install

# Tạo .env.local
#   NEXT_PUBLIC_API_URL=http://localhost:5000/api

npm run dev
# Frontend chạy tại http://localhost:3000
```

---

## Tài khoản demo

| Username | Password | Role |
|---|---|---|
| `ducthinh` | `123456` | Admin |
| `nvkho_tuan` | `123456` | User |
| `nvkho_huong` | `123456` | User |
| `nv_nghisv` | `123456` | User (bị khóa) |

---

## Một số SKU để test quét QR

```
LAP-DELL-XP13P-001   LAP-APPL-MBA2-002
MOU-LOGI-MX3S-003   MOU-RAZR-DAV3-004
KEY-KEYC-K8P-005    KEY-CORS-K70P-006
MON-LG-27U60-007    MON-SAMS-G732-008
EAR-SONY-XM5-009    EAR-APPL-APP2-010
CAM-LOGI-BRIO-011   CAM-RAZR-KYU-012
NET-ASUS-AX88-013   NET-TPLI-POE24-014
SSD-SAMS-990P-015   HDD-WD-PURP-016
DOC-CALD-TS4-017    HUB-ANKE-A7U3-018
```

---

## API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/products` | Danh sách sản phẩm |
| POST | `/api/products` | Thêm sản phẩm (Admin) |
| PUT | `/api/products/:id` | Sửa sản phẩm (Admin) |
| DELETE | `/api/products/:id` | Xóa sản phẩm (Admin) |
| GET | `/api/inventory` | Nhật ký nhập/xuất |
| POST | `/api/inventory` | Tạo phiếu nhập/xuất |
| GET | `/api/users` | Danh sách user (Admin) |

Swagger UI: `http://localhost:5000/api-docs`

---

## Tech stack

**Frontend:** Next.js 15 (App Router), Tailwind CSS 4, Zustand, Lucide React, React Hook Form + Zod, Framer Motion, XLSX

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT + Bcrypt, Nodemailer

---

## Người thực hiện

Dự án được phát triển bởi nhóm **ducthinhn & minhduc & ducan** — 2026.
