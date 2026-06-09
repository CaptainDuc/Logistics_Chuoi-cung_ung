/**
 * Controller xử lý các thao tác xác thực: đăng nhập, đăng ký, làm mới token, đăng xuất, quên mật khẩu.
 * Sử dụng cơ chế JWT với Access Token (15 phút) và Refresh Token (7 ngày).
 */
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const nodemailer = require("nodemailer");

/**
 * Tạo Access Token (hạn ngắn 15 phút).
 */
const AccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

/**
 * Tạo Refresh Token (hạn dài 7 ngày).
 */
const RefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Cấu hình transporter Nodemailer.
 */
const taoTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/* =========================================================
 * POST /api/auth/register
 * Đăng ký tài khoản mới.
 * ========================================================= */
const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username và password là bắt buộc.",
      });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Tên đăng nhập phải có ít nhất 3 ký tự.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Tên đăng nhập đã tồn tại trong hệ thống.",
      });
    }

    const matKhauHash = await bcrypt.hash(password, 10);
    const taiKhoanMoi = await User.create({
      username: username.trim(),
      password: matKhauHash,
      email: email ? email.toLowerCase().trim() : null,
      role: "User",
    });

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công.",
      data: {
        _id: taiKhoanMoi._id,
        username: taiKhoanMoi.username,
        role: taiKhoanMoi.role,
      },
    });
  } catch (err) {
    console.error("[Auth Controller] Lỗi register:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký.",
    });
  }
};

/* =========================================================
 * POST /api/auth/login
 * Đăng nhập: xác thực username + password, trả về AccessToken & RefreshToken.
 * ========================================================= */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username và password là bắt buộc.",
      });
    }

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không chính xác.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa. Liên hệ Admin để được hỗ trợ.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không chính xác.",
      });
    }

    const accessToken = AccessToken(user._id, user.role);
    const refreshToken = RefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công.",
      data: {
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error("[Auth Controller] Lỗi login:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng nhập.",
    });
  }
};

/* =========================================================
 * POST /api/auth/refresh-token
 * Làm mới Access Token bằng Refresh Token.
 * ========================================================= */
const refreshTokenFn = async (req, res) => {
  try {
    const { refreshToken: clientToken } = req.body;

    if (!clientToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh Token là bắt buộc.",
      });
    }

    let decoded;
    try {
      const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
      decoded = jwt.verify(clientToken, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Refresh Token không hợp lệ hoặc đã hết hạn.",
      });
    }

    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Người dùng không tồn tại.",
      });
    }

    if (user.refreshToken !== clientToken) {
      return res.status(401).json({
        success: false,
        message:
          "Refresh Token không hợp lệ. Có thể phiên đã bị đăng xuất hoặc token đã bị đánh cắp.",
      });
    }

    const accessToken = AccessToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Làm mới Access Token thành công.",
      data: {
        accessToken,
      },
    });
  } catch (err) {
    console.error("[Auth Controller] Lỗi refreshToken:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi làm mới token.",
    });
  }
};

/* =========================================================
 * POST /api/auth/logout
 * Đăng xuất: xóa refreshToken trong DB.
 * ========================================================= */
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      } catch {
        // Token không hợp lệ thì vẫn trả thành công.
      }
    }

    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công.",
    });
  } catch (err) {
    console.error("[Auth Controller] Lỗi logout:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng xuất.",
    });
  }
};

/* =========================================================
 * POST /api/auth/forgot-password
 * Gửi email chứa link đặt lại mật khẩu.
 * ========================================================= */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email là bắt buộc.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Không tiết lộ user có tồn tại hay không để tránh user enumeration
      return res.status(200).json({
        success: true,
        message:
          "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    const transporter = taoTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Hệ thống Quản lý Kho" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Yêu cầu đặt lại mật khẩu - Smart WMS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Yêu cầu đặt lại mật khẩu</h2>
          <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản tại <strong>Smart WMS</strong>.</p>
          <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Đặt lại mật khẩu
            </a>
          </div>
          <p style="font-size: 12px; color: #888;">Link có hiệu lực trong <strong>15 phút</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">Email được gửi tự động từ Hệ thống Quản lý Kho PTIT.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error("[Email] Gửi email reset thất bại:", emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message:
        "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.",
    });
  } catch (err) {
    console.error("[Auth Controller] Lỗi forgotPassword:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xử lý yêu cầu đặt lại mật khẩu.",
    });
  }
};

/* =========================================================
 * POST /api/auth/reset-password
 * Đặt lại mật khẩu bằng token đã gửi qua email.
 * ========================================================= */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token và mật khẩu mới là bắt buộc.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = null; // Hủy mọi phiên đang hoạt động
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.",
    });
  } catch (err) {
    console.error("[Auth Controller] Lỗi resetPassword:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi đặt lại mật khẩu.",
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken: refreshTokenFn,
  logout,
  forgotPassword,
  resetPassword,
};
