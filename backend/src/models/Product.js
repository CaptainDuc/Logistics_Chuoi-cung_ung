/**
 * Schema cho collection "products" — sản phẩm / tồn kho trong kho hàng.
 * supplierId tham chiếu đến Supplier (quan hệ N-1). Một nhà cung cấp có thể cung cấp nhiều sản phẩm.
 * minQuantity là ngưỡng cảnh báo: nếu quantity < minQuantity thì cần nhập thêm hàng.
 */
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm (name) là bắt buộc.'],
      trim: true,
      minlength: [1, 'Tên sản phẩm không được để trống.'],
      maxlength: [200, 'Tên sản phẩm không được vượt quá 200 ký tự.'],
    },
    // SKU là mã định danh duy nhất cho mỗi sản phẩm trong kho.
    sku: {
      type: String,
      required: [true, 'Mã SKU là bắt buộc.'],
      unique: [true, 'Mã SKU đã tồn tại trong hệ thống.'],
      trim: true,
      uppercase: true, // Chuẩn hóa SKU về chữ hoa.
      maxlength: [50, 'Mã SKU không được vượt quá 50 ký tự.'],
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng tồn kho không được nhỏ hơn 0.'],
    },
    // Ngưỡng tồn kho tối thiểu — dùng để cảnh báo khi cần nhập thêm.
    minQuantity: {
      type: Number,
      default: 10,
      min: [0, 'Số lượng tối thiểu không được nhỏ hơn 0.'],
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Vị trí lưu trữ không được vượt quá 100 ký tự.'],
    },
  },
  {
    timestamps: true,
    collection: 'products',
  }
);

productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ name: 'text' });        // Hỗ trợ tìm kiếm từ khóa trong tên sản phẩm.
productSchema.index({ supplierId: 1 });       // Tăng tốc truy vấn theo nhà cung cấp.

// Virtual field: trạng thái tồn kho dựa trên quantity so với minQuantity.
productSchema.virtual('trangThaiTonKho').get(function () {
  if (this.quantity <= 0) {
    return 'Hết hàng';
  } else if (this.quantity < this.minQuantity) {
    return 'Sắp hết - Cần nhập thêm';
  } else {
    return 'Còn hàng';
  }
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
