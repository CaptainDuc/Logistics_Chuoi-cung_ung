# 📦 Hệ Thống Quản Lý Kho Hàng Thông Minh (Smart Warehouse Management System)

Chào mừng bạn đến với dự án Hệ thống Quản lý Kho hàng thông minh. Dự án này bao gồm hai ứng dụng Frontend chuyên biệt nhằm tối ưu hóa quy trình làm việc trong kho hàng hiện đại.

---

## 🌟 Tổng Quan Dự Án

Hệ thống được thiết kế theo phong cách **Glassmorphism Premium**, mang lại trải nghiệm người dùng cao cấp, mượt mà và trực quan.

### 🌓 1. Web Application (Quản lý & Giám sát)
- **Mục tiêu:** Dành cho quản lý kho tại văn phòng.
- **Tính năng chính:**
    - Dashboard thống kê dữ liệu trực quan.
    - Quản lý danh mục vật tư, tồn kho.
    - Theo dõi lịch sử nhập/xuất kho.
    - Xuất báo cáo Excel định kỳ.

### 📱 2. Mobile Application (Vận hành hiện trường)
- **Mục tiêu:** Dành cho nhân viên kho di chuyển trong hiện trường.
- **Tính năng chính:**
    - **SmartScan QR:** Quét mã SKU nhanh chóng bằng camera.
    - Giao diện Mobile-First với các thẻ hành động lớn.
    - Thanh điều hướng Bottom Navigation linh hoạt.
    - Hiệu ứng chuyển động mượt mà bằng Framer Motion.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** Next.js 14+, React, Tailwind CSS.
- **Animations:** Framer Motion, Lucide React Icons.
- **State Management:** Zustand.
- **Data Handling:** ExcelJS.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Code

### Bước 1: Clone dự án
```bash
git clone (https://github.com/CaptainDuc/Logistics_Chuoi-cung_ung)
cd <tên thư mục dự án>
```
### Bước 2: Cấu hình và chạy Backend
Backend đảm nhận vai trò xử lý logic nghiệp vụ và kết nối Database.
```bash
cd backend
npm install
Tạo file .env và cấu hình các biến môi trường:
#PORT=5000
#MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nexus_db
#JWT_SECRET=your_secret_key
#JWT_REFRESH_SECRET=your_secret_key
npm start
```
### Bước 3: Cài đặt và Chạy Web App
Cần cài đặt dependencies cho từng ứng dụng:
```bash
cd web-app
npm install
npm run dev
# Mở trình duyệt tại: http://localhost:3000
```

### Bước 4: Cài đặt và Chạy Mobile App
```bash
cd ../mobile-app
npm install
npm run dev
# Mở trình duyệt tại: http://localhost:3001
```
---
