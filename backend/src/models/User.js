/**
 * Schema cho collection "users" — tài khoản đăng nhập hệ thống.
 * password được mã hóa bcrypt ở tầng service trước khi lưu, không lưu plain text.
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Tên đăng nhập (username) là bắt buộc.'],
      unique: [true, 'Tên đăng nhập (username) đã tồn tại trong hệ thống.'],
      trim: true,
      minlength: [3, 'Tên đăng nhập phải có ít nhất 3 ký tự.'],
      maxlength: [50, 'Tên đăng nhập không được vượt quá 50 ký tự.'],
    },
    // select: false — mặc định KHÔNG trả về password khi query (bảo mật).
    password: {
      type: String,
      required: [true, 'Mật khẩu (password) là bắt buộc.'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự.'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['Admin', 'User'],
        message: 'Vai trò (role) phải là "Admin" hoặc "User".',
      },
      default: 'User',
    },
    // refreshToken dùng để làm mới JWT access token khi hết hạn.
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index duy nhất trên username để tăng tốc truy vấn xác thực.
userSchema.index({ username: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
