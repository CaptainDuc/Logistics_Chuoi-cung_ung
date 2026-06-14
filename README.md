# 📦 Smart WMS - Hệ Thống Quản Lý Kho Hàng Thông Minh

Hệ thống quản lý kho hàng thông minh tích hợp đa nền tảng, bao gồm một ứng dụng Web giám sát cho Admin và một ứng dụng Mobile vận hành hiện trường dành cho nhân viên kho.

Dự án được thiết kế theo phong cách giao diện **Glassmorphism Premium** hiện đại, trực quan và tối ưu hóa trải nghiệm người dùng.

---

## 🌟 Tổng Quan Kiến Trúc Nền Tảng

Hệ thống hoạt động theo mô hình Client-Server chia tách biệt thành 3 phân hệ chính trong cùng một kho lưu trữ:

### 🌓 1. Web Application (Quản lý & Giám sát tổng quan)

- **Mục tiêu:** Dành cho quản lý kho tại văn phòng sử dụng trên máy tính.
- **Tính năng chính:**
  - Dashboard thống kê số liệu tổng tồn kho, tổng nhập, tổng xuất theo thời gian thực.
  - Quản lý danh mục vật tư, sản phẩm chi tiết (Bộ lọc tìm kiếm, phân trang, sắp xếp).
  - Hệ thống tự động lọc và cảnh báo sản phẩm sắp chạm hạn mức hết hàng (`low-stock`).
  - Theo dõi và lưu vết lịch sử biến động kho (Logs).
  - Xuất báo cáo dữ liệu tồn kho trực tiếp ra file Excel (`.xlsx`).

### 📱 2. Mobile Application (Vận hành số hóa hiện trường)

- **Mục tiêu:** Dành cho nhân viên kho di chuyển liên tục dưới mặt đất.
- **Tính năng chính:**
  - **SmartScan QR:** Giả lập/Quét mã SKU nhanh chóng thông qua camera thiết bị.
  - Giao diện Mobile-First tinh gọn, các thẻ hành động lớn hạn chế tối đa việc ấn nhầm.
  - Thanh điều hướng Bottom Navigation linh hoạt tiện dụng khi thao tác một tay.
  - Hiệu ứng chuyển động mượt mà bằng Framer Motion tăng tính tương tác sinh động.

### ⚙️ 3. Backend Server & Automation

- Hệ thống API RESTful quản lý toàn bộ logic nghiệp vụ kho.
- **Hệ thống thông báo tự động:** Tự động kích hoạt gửi Email cảnh báo qua _Nodemailer_ tới Admin ngay khi phát hiện sản phẩm bị xuất kho vượt ngưỡng an toàn.

---

## 🛠️ Công Nghệ Sử Dụng

| Thành phần              | Công nghệ tích hợp                              |
| :---------------------- | :---------------------------------------------- |
| **Frontend Web/Mobile** | Next.js 14+ (App Router), React, Tailwind CSS   |
| **State Management**    | Zustand (Đồng bộ mượt mà trạng thái Client)     |
| **Animations & Icons**  | Framer Motion, Lucide React Icons               |
| **Backend Core**        | Node.js, Express.js                             |
| **Database & ORM**      | MongoDB, Mongoose                               |
| **Testing Framework**   | Jest, Supertest (Kiểm thử đơn vị logic Backend) |
| **Excel Handling**      | XLSX / ExcelJS                                  |

---

## 🗂️ Cấu Trúc Thư Mục Dự Án

```text
├── backend/             # Mã nguồn Backend (Node.js & Express)
│   ├── src/
│   │   ├── config/      # Cấu hình Database & Swagger
│   │   ├── controllers/ # Xử lý logic nghiệp vụ (với file kiểm thử .test.js)
│   │   ├── models/      # Định nghĩa Schema cơ sở dữ liệu Mongoose
│   │   └── routes/      # Định nghĩa các tuyến đường API
├── web-app/             # Ứng dụng Quản lý trên trình duyệt (Next.js)
│   └── src/app/         # Giao diện Dashboard, Products, Low-stock...
└── mobile-app/          # Ứng dụng Quận quét mã hiện trường (Next.js Mobile-First)
🧪 Chất Lượng Mã Nguồn & Testing (Quality Assurance)
Dự án chú trọng vào tính chính xác của dữ liệu tồn kho bằng việc triển khai hệ thống Unit Test nghiêm ngặt cho Backend.

Framework kiểm thử: Jest & Supertest.

Phạm vi kiểm thử: Hàm kiểm tra logic quét mã Nhập/Xuất kho (quetMaQR) cô lập qua cơ chế Mocking.

Các kịch bản đã test:

Cộng dồn số lượng chính xác khi thực hiện lệnh Import (Nhập kho).

Khấu trừ số lượng chuẩn xác khi thực hiện lệnh Export (Xuất kho).

Chặn đứng giao dịch dữ liệu, không lưu vào DB và trả về lỗi 400 khi số lượng xuất kho lớn hơn số lượng hiện có (Chống âm kho).

Để chạy toàn bộ các ca kiểm thử, di chuyển vào thư mục backend và chạy lệnh:

Bash
cd backend
npm run test
🚀 Hướng Dẫn Cài Đặt & Khởi Chạy
Bước 1: Tải mã nguồn về máy cục bộ
Bash
git clone [https://github.com/CaptainDuc/Logistics_Chuoi-cung_ung.git](https://github.com/CaptainDuc/Logistics_Chuoi-cung_ung.git)
cd Logistics_Chuoi-cung_ung
Bước 2: Khởi hình và chạy Backend
Di chuyển vào thư mục backend:

Bash
cd backend
Cài đặt các gói thư viện phụ thuộc:

Bash
npm install
Tạo một file .env nằm tại thư mục gốc của /backend và cấu hình các khóa sau:

Đoạn mã
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nexus_db
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_key
EMAIL_USER=your_gmail_app_email@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_EMAIL=admin_receive_notification@gmail.com
Khởi chạy Server ở chế độ nhà phát triển:

Bash
npm start
Bước 3: Cài đặt và Chạy ứng dụng Web (Quản lý)
Mở một Terminal mới song song và thực hiện:

Bash
cd web-app
npm install
npm run dev
Trình duyệt sẽ tự động kích hoạt tại địa chỉ: http://localhost:3000/dashboard

Bước 4: Cài đặt và Chạy ứng dụng Mobile (Hiện trường)
Mở một Terminal mới song song và thực hiện:

Bash
cd mobile-app
npm install
npm run dev
Trình duyệt sẽ tự động kích hoạt giao diện điện thoại tại địa chỉ: http://localhost:3001
```
