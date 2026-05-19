# Logistics_Chuoi-cung_ung
Hệ thống kiểm kho thông minh sử dụng mã QR code trên nền tảng web responsive

## Triển khai Frontend và Backend

### Backend (Render / Railway)
1. Tạo một service mới và trỏ tới thư mục `backend`.
2. Chọn command khởi động: `npm start`.
3. Thiết lập biến môi trường trong dashboard:
   - `MONGO_URI` = MongoDB Atlas URI
   - `JWT_SECRET` = giá trị bí mật JWT
   - `JWT_REFRESH_SECRET` = giá trị bí mật refresh token
   - `EMAIL_SERVICE` = ví dụ `gmail`
   - `EMAIL_USER` = email gửi cảnh báo
   - `EMAIL_PASS` = mật khẩu ứng dụng hoặc app password
   - `ADMIN_EMAIL` = email admin nhận cảnh báo
   - `CORS_ORIGIN` = URL frontend (ví dụ `https://<your-app>.vercel.app`)
   - `PORT` = `4000` (nếu cần)
4. Kết nối MongoDB Atlas với `MONGO_URI`.
5. Chạy `node seed.js` nếu cần nạp dữ liệu mẫu.

### Frontend (Vercel)
1. Đăng ký project mới và chọn thư mục `frontend`.
2. Thiết lập biến môi trường:
   - `NEXT_PUBLIC_BACKEND_URL` = URL backend trên Render/Railway
3. Deploy và kiểm tra:
   - `https://<your-frontend>.vercel.app`
   - backend URL phải cùng domain với `CORS_ORIGIN`.

### Lưu ý môi trường
- `frontend/.env.example` và `backend/.env.example` đã được tạo sẵn.
- Backend cần CORS cho phép frontend production để FE gọi API trực tiếp.
- Frontend sẽ gọi API backend bằng biến `NEXT_PUBLIC_BACKEND_URL`.
