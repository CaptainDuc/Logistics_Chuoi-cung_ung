/**
 * Controller xử lý các thao tác xác thực: đăng nhập, làm mới token, đăng xuất.
 * Sử dụng cơ chế JWT với Access Token (15 phút) và Refresh Token (7 ngày).
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Tạo Access Token (hạn ngắn 15 phút).
 * @param {string} userId - ID của người dùng
 * @param {string} role - Vai trò của người dùng
 * @returns {string} JWT Access Token
 */
const AccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Tạo Refresh Token (hạn dài 7 ngày).
 * @param {string} userId - ID của người dùng
 * @returns {string} JWT Refresh Token
 */
const RefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * POST /api/auth/login
 * Đăng nhập: xác thực username + password, trả về AccessToken & RefreshToken.
 * RefreshToken được lưu vào DB để quản lý phiên làm việc.
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username và password là bắt buộc.',
      });
    }

    // Tìm user, bao gồm cả trường password (select: false nên cần +password).
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      });
    }

    // So sánh mật khẩu bằng bcrypt.
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
      });
    }

    // Tạo token.
    const accessToken = AccessToken(user._id, user.role);
    const refreshToken = RefreshToken(user._id);

    // Lưu refreshToken vào DB để quản lý phiên.
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công.',
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
    console.error('[Auth Controller] Lỗi login:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập.',
    });
  }
};

/**
 * POST /api/auth/refresh-token
 * Làm mới Access Token bằng Refresh Token.
 * Kiểm tra token hợp lệ và đối chiếu với refreshToken trong DB.
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: clientToken } = req.body;

    if (!clientToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh Token là bắt buộc.',
      });
    }

    // Giải mã refreshToken.
    let decoded;
    try {
      const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
      decoded = jwt.verify(clientToken, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Refresh Token không hợp lệ hoặc đã hết hạn.',
      });
    }

    // Tìm user và đối chiếu refreshToken trong DB.
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại.',
      });
    }

    if (user.refreshToken !== clientToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh Token không hợp lệ. Có thể phiên đã bị đăng xuất hoặc token đã bị đánh cắp.',
      });
    }

    // Tạo AccessToken mới.
<<<<<<< HEAD
    const accessToken = AccessToken(user._id, user.role);
=======
    const accessToken = taoAccessToken(user._id, user.role);
>>>>>>> main

    return res.status(200).json({
      success: true,
      message: 'Làm mới Access Token thành công.',
      data: {
        accessToken,
      },
    });

  } catch (err) {
    console.error('[Auth Controller] Lỗi refreshToken:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi làm mới token.',
    });
  }
};

/**
 * POST /api/auth/logout
 * Đăng xuất: xóa refreshToken trong DB để vô hiệu hóa phiên làm việc.
 * Client cần gửi kèm Access Token trong Header Authorization.
 */
const logout = async (req, res) => {
  try {
    // Lấy userId từ token đã được giải mã (nhờ middleware protect ở route).
    // Tuy nhiên, logout có thể được gọi kèm token hoặc không.
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      } catch {
        // Token không hợp lệ thì vẫn trả thành công (token đã có thể hết hạn).
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công.',
    });

  } catch (err) {
    console.error('[Auth Controller] Lỗi logout:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng xuất.',
    });
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
};
