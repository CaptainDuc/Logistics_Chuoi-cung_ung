/**
 * Schema cho collection "users" — tài khoản đăng nhập hệ thống.
 * password được mã hóa bcrypt, không lưu plain text.
 * Hỗ trợ: isActive (khóa/mở tài khoản), passwordResetToken (quên mật khẩu).
 */
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Tên đăng nhập (username) là bắt buộc."],
      unique: [true, "Tên đăng nhập (username) đã tồn tại trong hệ thống."],
      trim: true,
      minlength: [3, "Tên đăng nhập phải có ít nhất 3 ký tự."],
      maxlength: [50, "Tên đăng nhập không được vượt quá 50 ký tự."],
    },
    // select: false — mặc định KHÔNG trả về password khi query (bảo mật).
    password: {
      type: String,
      required: [true, "Mật khẩu (password) là bắt buộc."],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự."],
      select: false,
    },
    // Email tùy chọn — dùng cho chức năng quên mật khẩu.
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Địa chỉ email không hợp lệ.",
      ],
    },
    role: {
      type: String,
      enum: {
        values: ["Admin", "User"],
        message: 'Vai trò (role) phải là "Admin" hoặc "User".',
      },
      default: "User",
    },
    // Trạng thái tài khoản: false = bị khóa, true = hoạt động.
    isActive: {
      type: Boolean,
      default: true,
    },
    // refreshToken dùng để làm mới JWT access token khi hết hạn.
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    // Token đặt lại mật khẩu (hash SHA256).
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    // Thời điểm hết hạn của token đặt lại mật khẩu.
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index duy nhất trên username để tăng tốc truy vấn xác thực.
userSchema.index({ username: 1 }, { unique: true });
// Index trên email để tìm kiếm khi quên mật khẩu.
userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
