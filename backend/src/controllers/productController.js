/**
 * Controller xử lý các nghiệp vụ liên quan đến Sản Phẩm (Product).
 * Cung cấp đầy đủ CRUD: lấy danh sách, chi tiết, thêm mới, cập nhật, xóa.
 * Tất cả các hàm đều được bảo vệ bởi middleware protect (yêu cầu đăng nhập).
 */
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

/**
 * GET /api/products
 * Lấy toàn bộ danh sách sản phẩm trong kho.
 * Hỗ trợ tìm kiếm theo tên (query ?search=), lọc theo nhà cung cấp (query ?supplierId=).
 * populate supplierId để trả về thông tin nhà cung cấp thay vì chỉ ObjectId.
 */
const layTatCaSanPham = async (req, res) => {
  try {
    const { search, supplierId } = req.query;
    const filter = {};

    // Tìm kiếm theo tên sản phẩm (không phân biệt hoa thường).
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Lọc theo nhà cung cấp nếu có.
    if (supplierId) {
      filter.supplierId = supplierId;
    }

    const danhSachSanPham = await Product.find(filter)
      .populate('supplierId', 'name contactName phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: `Lấy danh sách sản phẩm thành công. Tìm thấy ${danhSachSanPham.length} sản phẩm.`,
      data: danhSachSanPham,
      total: danhSachSanPham.length,
    });

  } catch (err) {
    console.error('[Product Controller] Lỗi layTatCaSanPham:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách sản phẩm.',
    });
  }
};

/**
 * GET /api/products/:id
 * Lấy chi tiết một sản phẩm theo ID.
 * populate supplierId để trả thông tin nhà cung cấp đầy đủ.
 */
const layChiTietSanPham = async (req, res) => {
  try {
    const { id } = req.params;

    const sanPham = await Product.findById(id).populate('supplierId', 'name contactName email phone');

    if (!sanPham) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sản phẩm với ID: ${id}.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy chi tiết sản phẩm thành công.',
      data: sanPham,
    });

  } catch (err) {
    console.error('[Product Controller] Lỗi layChiTietSanPham:', err.message);

    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `ID sản phẩm không hợp lệ: ${req.params.id}.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết sản phẩm.',
    });
  }
};

/**
 * POST /api/products
 * Thêm mới một sản phẩm vào kho.
 * Tự động chuẩn hóa SKU về chữ hoa (schema đã cấu hình uppercase: true).
 * Kiểm tra SKU trùng lặp trước khi tạo mới.
 */
const taoSanPhamMoi = async (req, res) => {
  try {
    const { name, sku, quantity, minQuantity, supplierId, location } = req.body;

    if (!name || !sku) {
      return res.status(400).json({
        success: false,
        message: 'Tên sản phẩm (name) và mã SKU là bắt buộc.',
      });
    }

    // Kiểm tra SKU đã tồn tại chưa (SKU unique trong schema, nhưng bắt lỗi để trả message rõ ràng hơn).
    const skuTonTai = await Product.findOne({ sku: sku.trim().toUpperCase() });
    if (skuTonTai) {
      return res.status(409).json({
        success: false,
        message: `Mã SKU "${sku}" đã tồn tại trong hệ thống. Vui lòng sử dụng mã khác.`,
      });
    }

    // Kiểm tra supplierId có tồn tại trong DB không (nếu được cung cấp).
    if (supplierId) {
      const nhaCungCap = await Supplier.findById(supplierId);
      if (!nhaCungCap) {
        return res.status(400).json({
          success: false,
          message: `Nhà cung cấp với ID "${supplierId}" không tồn tại.`,
        });
      }
    }

    const sanPhamMoi = await Product.create({
      name,
      sku: sku.trim().toUpperCase(),
      quantity: quantity !== undefined ? quantity : 0,
      minQuantity: minQuantity !== undefined ? minQuantity : 10,
      supplierId: supplierId || null,
      location: location || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm mới thành công.',
      data: sanPhamMoi,
    });

  } catch (err) {
    console.error('[Product Controller] Lỗi taoSanPhamMoi:', err.message);

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Mã SKU đã tồn tại trong hệ thống.',
      });
    }

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('; '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo sản phẩm mới.',
    });
  }
};

/**
 * PUT /api/products/:id
 * Cập nhật thông tin sản phẩm theo ID.
 * Cho phép cập nhật từng trường một cách linh hoạt.
 * Không cho phép sửa SKU nếu trùng với sản phẩm khác.
 */
const capNhatSanPham = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, quantity, minQuantity, supplierId, location } = req.body;

    // Kiểm tra sản phẩm có tồn tại không.
    const sanPhamHienTai = await Product.findById(id);
    if (!sanPhamHienTai) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sản phẩm với ID: ${id}.`,
      });
    }

    // Nếu cập nhật SKU, kiểm tra trùng lặp (không tính chính sản phẩm đang sửa).
    if (sku) {
      const skuMoi = sku.trim().toUpperCase();
      const skuTrung = await Product.findOne({
        sku: skuMoi,
        _id: { $ne: id },
      });
      if (skuTrung) {
        return res.status(409).json({
          success: false,
          message: `Mã SKU "${skuMoi}" đã được sử dụng bởi sản phẩm khác.`,
        });
      }
    }

    // Kiểm tra supplierId hợp lệ (nếu được cung cấp).
    if (supplierId !== undefined) {
      if (supplierId === null || supplierId === '') {
        // Cho phép xóa liên kết nhà cung cấp.
      } else {
        const nhaCungCap = await Supplier.findById(supplierId);
        if (!nhaCungCap) {
          return res.status(400).json({
            success: false,
            message: `Nhà cung cấp với ID "${supplierId}" không tồn tại.`,
          });
        }
      }
    }

    // Cập nhật từng trường nếu có giá trị mới.
    if (name !== undefined) sanPhamHienTai.name = name;
    if (sku !== undefined) sanPhamHienTai.sku = sku.trim().toUpperCase();
    if (quantity !== undefined) sanPhamHienTai.quantity = quantity;
    if (minQuantity !== undefined) sanPhamHienTai.minQuantity = minQuantity;
    if (supplierId !== undefined) sanPhamHienTai.supplierId = supplierId || null;
    if (location !== undefined) sanPhamHienTai.location = location;

    await sanPhamHienTai.save();

    const sanPhamCapNhat = await Product.findById(id).populate('supplierId', 'name contactName phone');

    return res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công.',
      data: sanPhamCapNhat,
    });

  } catch (err) {
    console.error('[Product Controller] Lỗi capNhatSanPham:', err.message);

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Mã SKU đã tồn tại trong hệ thống.',
      });
    }

    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `ID sản phẩm không hợp lệ: ${req.params.id}.`,
      });
    }

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join('; '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật sản phẩm.',
    });
  }
};

/**
 * DELETE /api/products/:id
 * Xóa một sản phẩm khỏi kho theo ID.
 * Chỉ tài khoản Admin mới có quyền thực hiện (authorize('Admin') ở route).
 * Xóa thành công thì trả về thông tin sản phẩm đã xóa.
 */
const xoaSanPham = async (req, res) => {
  try {
    const { id } = req.params;

    const sanPhamDaXoa = await Product.findByIdAndDelete(id);

    if (!sanPhamDaXoa) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sản phẩm với ID: ${id}.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm thành công.',
      data: sanPhamDaXoa,
    });

  } catch (err) {
    console.error('[Product Controller] Lỗi xoaSanPham:', err.message);

    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `ID sản phẩm không hợp lệ: ${req.params.id}.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa sản phẩm.',
    });
  }
};

module.exports = {
  layTatCaSanPham,
  layChiTietSanPham,
  taoSanPhamMoi,
  capNhatSanPham,
  xoaSanPham,
};
