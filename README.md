# 📦 Hệ Thống Quản Lý Kho Hàng Nexus (Nexus Warehouse Management)

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
git clone <url-github-cua-ban>
cd demo
```

### Bước 2: Cài đặt và Chạy Web App
Cần cài đặt dependencies cho từng ứng dụng:
```bash
cd web-app
npm install
npm run dev
# Mở trình duyệt tại: http://localhost:3000
```

### Bước 3: Cài đặt và Chạy Mobile App
```bash
cd ../mobile-app
npm install
npm run dev
# Mở trình duyệt tại: http://localhost:3001
```

---

## 📤 Hướng dẫn đẩy Code lên GitHub (Chỉ đẩy Web & Mobile)

Lưu ý: Tôi đã cấu hình file `.gitignore` để tự động loại bỏ thư mục `backend`. Bạn chỉ cần thực hiện các lệnh sau:

1. **Khởi tạo Git (nếu chưa có):**
   ```bash
   git init
   ```

2. **Kiểm tra trạng thái:** (Bạn sẽ thấy `backend/` không xuất hiện trong danh sách)
   ```bash
   git status
   ```

3. **Add và Commit:**
   ```bash
   git add .
   description: "feat: hoàn thiện giao diện Premium cho Web & Mobile"
   git commit -m "feat: hoàn thiện giao diện Premium cho Web & Mobile"
   ```

4. **Kết nối repository và Push:**
   ```bash
   git remote add origin <url-repository-cua-ban>
   git branch -M main
   git push -u origin main
   ```

---

## 📝 Lưu Ý
- Thư mục `backend` được giữ lại local để bảo mật logic xử lý. 
- Đảm bảo bạn đã cấu hình biến môi trường `NEXT_PUBLIC_API_URL` trong các file `.env` nếu cần kết nối với Server thực tế.

---
*Dự án được phát triển bởi Antigravity AI.*
