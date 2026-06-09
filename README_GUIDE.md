# 🚀 Hướng dẫn Khởi chạy Hệ thống Logistics PTIT

Dự án đã được hợp nhất thành một cấu trúc duy nhất để đảm bảo đồng bộ dữ liệu giữa Web và Mobile.

## 📁 Cấu trúc Thư mục
- `/backend`: API Server (Node.js/Express) - Chạy trên cổng **5000**.
- `/web-app`: Frontend dành cho Máy tính (Next.js) - Chạy trên cổng **3000**.
- `/mobile-app`: Frontend dành cho Điện thoại (Next.js) - Chạy trên cổng **3001**.

---

## 🛠️ Bước 1: Khởi động Backend (QUAN TRỌNG NHẤT)
Mở một terminal mới tại thư mục gốc:
```bash
cd backend
npm install
npm run dev
```
*Lưu ý: Đảm bảo bạn đã có file `.env` với `MONGODB_URI` trong thư mục này.*

## 💻 Bước 2: Khởi động Giao diện Web
Mở một terminal mới:
```bash
cd web-app
npm install
npm run dev
```
Truy cập: `http://localhost:3000`

## 📱 Bước 3: Khởi động Giao diện Mobile
Mở một terminal mới:
```bash
cd mobile-app
npm install
npm run dev -- -p 3001
```
*(Chạy cổng 3001 để không bị trùng với bản Web)*
Truy cập: `http://localhost:3001`

---

## 📤 Cách Đẩy code lên GitHub (Chỉ đẩy Frontend)

Để làm đúng yêu cầu của bạn là **KHÔNG đẩy Backend**, tôi đã cấu hình file `.gitignore` ở ngoài cùng. Tuy nhiên, nếu bạn muốn chắc chắn nhất, hãy làm theo các bước sau:

1. **Khởi tạo Git tại thư mục gốc:**
   ```bash
   git init
   ```

2. **Tạo/Kiểm tra file `.gitignore` tại root với nội dung:**
   ```text
   backend/
   node_modules/
   .env*
   .next/
   ```

3. **Kiểm tra trạng thái (Bạn sẽ thấy backend không xuất hiện):**
   ```bash
   git status
   ```

4. **Add và Commit:**
   ```bash
   git add web-app mobile-app .gitignore README.md
   git commit -m "Initial commit: Web and Mobile frontends"
   ```

5. **Đẩy lên GitHub:**
   ```bash
   git remote add origin <link-github-cua-ban>
   git push -u origin main
   ```

---

**Chúc bạn hoàn thành đồ án xuất sắc!**
