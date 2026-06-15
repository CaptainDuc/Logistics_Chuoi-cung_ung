const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const { sendInventoryAlert } = require("../utils/mailer");

const layTatCaSanPham = async (req, res) => {
  try {
    const { page, limit, search, supplierId, sortBy, sortOrder } = req.query;

    const soTrang = Math.max(1, parseInt(page) || 1);
    const soItemTrenTrang = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const boQua = (soTrang - 1) * soItemTrenTrang;

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (supplierId) {
      filter.supplierId = supplierId;
    }

    const truongSort = [
      "name",
      "sku",
      "quantity",
      "createdAt",
      "updatedAt",
    ].includes(sortBy)
      ? sortBy
      : "createdAt";
    const thuTuSort = sortOrder === "asc" ? 1 : -1;

    const [danhSachSanPham, tongSo] = await Promise.all([
      Product.find(filter)
        .populate("supplierId", "name contactName phone")
        .sort({ [truongSort]: thuTuSort })
        .skip(boQua)
        .limit(soItemTrenTrang)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const tongSoTrang = Math.ceil(tongSo / soItemTrenTrang);

    return res.status(200).json({
      success: true,
      message: `Lấy danh sách sản phẩm thành công. Trang ${soTrang}/${tongSoTrang}.`,
      data: danhSachSanPham,
      pagination: {
        currentPage: soTrang,
        totalPages: tongSoTrang,
        totalItems: tongSo,
        itemsPerPage: soItemTrenTrang,
        hasNextPage: soTrang < tongSoTrang,
        hasPrevPage: soTrang > 1,
      },
    });
  } catch (err) {
    console.error("[Product Controller] Lỗi layTatCaSanPham:", err.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách sản phẩm.",
    });
  }
};

const layChiTietSanPham = async (req, res) => {
  try {
    const { id } = req.params;
    const sanPham = await Product.findById(id).populate(
      "supplierId",
      "name contactName email phone",
    );

    if (!sanPham) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sản phẩm với ID: ${id}.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết sản phẩm thành công.",
      data: sanPham,
    });
  } catch (err) {
    console.error("[Product Controller] Lỗi layChiTietSanPham:", err.message);
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `ID sản phẩm không hợp lệ: ${req.params.id}.`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết sản phẩm.",
    });
  }
};

const laySanPhamSapHetHang = async (req, res) => {
  try {
    const danhSachSapHet = await Product.find({
      $expr: { $lte: ["$quantity", "$minQuantity"] },
    })
      .populate("supplierId", "name")
      .sort({ quantity: 1 });

    return res.status(200).json({
      success: true,
      message: `Tìm thấy ${danhSachSapHet.length} sản phẩm sắp hết hàng.`,
      data: danhSachSapHet,
    });
  } catch (err) {
    console.error(
      "[Product Controller] Lỗi laySanPhamSapHetHang:",
      err.message,
    );
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách sản phẩm sắp hết hàng.",
    });
  }
};

const taoSanPhamMoi = async (req, res) => {
  try {
    const { name, sku, quantity, minQuantity, supplierId, location } = req.body;

    if (!name || !sku) {
      return res.status(400).json({
        success: false,
        message: "Tên sản phẩm (name) và mã SKU là bắt buộc.",
      });
    }

    if (
      quantity !== undefined &&
      (typeof quantity !== "number" || quantity < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Số lượng (quantity) phải là số không âm.",
      });
    }

    if (
      minQuantity !== undefined &&
      (typeof minQuantity !== "number" || minQuantity < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Số lượng tối thiểu (minQuantity) phải là số không âm.",
      });
    }

    const skuTonTai = await Product.findOne({ sku: sku.trim().toUpperCase() });
    if (skuTonTai) {
      return res.status(409).json({
        success: false,
        message: `Mã SKU "${sku}" đã tồn tại trong hệ thống. Vui lòng sử dụng mã khác.`,
      });
    }

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
      location: location || "",
    });

    return res.status(201).json({
      success: true,
      message: "Tạo sản phẩm mới thành công.",
      data: sanPhamMoi,
    });
  } catch (err) {
    console.error("[Product Controller] Lỗi taoSanPhamMoi:", err.message);
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Mã SKU đã tồn tại trong hệ thống.",
      });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join("; "),
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo sản phẩm mới.",
    });
  }
};

const capNhatSanPham = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, quantity, minQuantity, supplierId, location } = req.body;

    const sanPhamHienTai = await Product.findById(id);
    if (!sanPhamHienTai) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sản phẩm với ID: ${id}.`,
      });
    }

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

    if (supplierId !== undefined) {
      if (supplierId === null || supplierId === "") {
        sanPhamHienTai.supplierId = null;
      } else {
        const nhaCungCap = await Supplier.findById(supplierId);
        if (!nhaCungCap) {
          return res.status(400).json({
            success: false,
            message: `Nhà cung cấp với ID "${supplierId}" không tồn tại.`,
          });
        }
        sanPhamHienTai.supplierId = supplierId;
      }
    }

    if (name !== undefined) sanPhamHienTai.name = name;
    if (sku !== undefined) sanPhamHienTai.sku = sku.trim().toUpperCase();
    if (quantity !== undefined) sanPhamHienTai.quantity = quantity;
    if (minQuantity !== undefined) sanPhamHienTai.minQuantity = minQuantity;
    if (location !== undefined) sanPhamHienTai.location = location;

    await sanPhamHienTai.save();

    // Tự động kiểm tra và gửi email cảnh báo nếu số lượng thấp hơn ngưỡng
    if (sanPhamHienTai.quantity <= sanPhamHienTai.minQuantity) {
      const userEmail = req.user ? req.user.email : process.env.ADMIN_EMAIL;
      const alertType = sanPhamHienTai.quantity === 0 ? "OUT_OF_STOCK" : "LOW_STOCK";
      
      console.log(
        `[Product Update]  Cảnh báo tồn kho cho "${sanPhamHienTai.name}". Đang gửi email tới: ${userEmail}`
      );
      
      // Không cần await để tránh làm chậm response trả về cho client
      sendInventoryAlert(userEmail, sanPhamHienTai, alertType);
    }

    const sanPhamCapNhat = await Product.findById(id).populate(
      "supplierId",
      "name contactName phone",
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công.",
      data: sanPhamCapNhat,
    });
  } catch (err) {
    console.error("[Product Controller] Lỗi capNhatSanPham:", err.message);
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Mã SKU đã tồn tại trong hệ thống.",
      });
    }
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `ID sản phẩm không hợp lệ: ${req.params.id}.`,
      });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join("; "),
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật sản phẩm.",
    });
  }
};

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
      message: "Xóa sản phẩm thành công.",
      data: sanPhamDaXoa,
    });
  } catch (err) {
    console.error("[Product Controller] Lỗi xoaSanPham:", err.message);
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `ID sản phẩm không hợp lệ: ${req.params.id}.`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa sản phẩm.",
    });
  }
};

module.exports = {
  layTatCaSanPham,
  layChiTietSanPham,
  taoSanPhamMoi,
  capNhatSanPham,
  xoaSanPham,
  laySanPhamSapHetHang,
};
