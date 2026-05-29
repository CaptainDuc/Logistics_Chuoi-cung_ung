# 📦 Hệ Thống Quản Lý Kho (Warehouse Management System)

Chào mừng bạn đến với dự án **Quản lý kho** - một giải pháp hiện đại để theo dõi hàng hóa, quản lý nhập/xuất kho và tối ưu hóa quy trình vận hành kho bãi.

## 🚀 Tính năng chính

- **Quản lý sản phẩm**: Thêm, sửa, xóa và theo dõi thông tin hàng hóa chi tiết.
- **Quản lý kho (Inbound/Outbound)**: 
    - Nhập kho: Ghi nhận số lượng sản phẩm nhập vào từ nhà cung cấp.
    - Xuất kho: Theo dõi luồng sản phẩm đi ra khỏi kho.
- **Lịch sử kho**: Nhật ký chi tiết các lần thay đổi số lượng hàng hóa.
- **Xác thực người dùng**: Đăng nhập, phân quyền (Admin/Nhân viên) thông qua JWT.
- **Tiện ích**: 
    - 📊 Xuất báo cáo ra file Excel.
    - 🔍 Hỗ trợ mã QR để quản lý sản phẩm nhanh chóng.
    - 📱 Giao diện nhạy (Responsive), hiển thị tốt trên mọi thiết bị.

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Quản lý trạng thái**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Biểu tượng**: [Lucide React](https://lucide.dev/)
- **Xử lý form**: React Hook Form + Zod

### Backend
- **Nền tảng**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Cơ sở dữ liệu**: [MongoDB](https://www.mongodb.com/) (thông qua Mongoose)
- **Xác thực**: JSON Web Token (JWT) + Bcrypt
- **Khác**: Nodemailer (Quên mật khẩu/Thông báo), XLSX (Xuất/Nhập Excel)

## 📁 Cấu trúc thư mục

```text
├── backend/            # Mã nguồn phía Server (API, Database)
│   ├── src/
│   │   ├── controllers/# Xử lý logic nghiệp vụ
│   │   ├── models/     # Định nghĩa Schema MongoDB
│   │   ├── routes/     # Các endpoint API
│   │   └── config/     # Cấu hình DB và các biến môi trường
├── frontend/           # Mã nguồn phía Client (Giao diện người dùng)
│   ├── src/
│   │   ├── app/        # Next.js routes & pages
│   │   ├── components/ # Các thành phần UI dùng chung
│   │   └── store/      # Zustand store
```

## ⚙️ Cài đặt và Chạy thử

### 1. Chuẩn bị
- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản mới nhất).
- Có tài khoản [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) hoặc MongoDB cục bộ.

### 2. Cài đặt Backend
```bash
cd backend
npm install
# Tạo file .env và điền các thông tin: MONGO_URI, JWT_SECRET
npm start
```

### 3. Cài đặt Frontend
```bash
cd frontend
npm install
# Tạo file .env.local và điền: NEXT_PUBLIC_API_URL
npm run dev
```

Mở trình duyệt và truy cập: `http://localhost:3000`

---
*Dự án được xây dựng với mục tiêu mang lại trải nghiệm quản lý kho trực quan và mạnh mẽ.*
