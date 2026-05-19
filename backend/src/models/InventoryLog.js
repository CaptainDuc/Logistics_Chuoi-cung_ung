/**
 * Schema cho collection "inventorylogs" — lịch sử nhập/xuất kho.
 * Mỗi document ghi nhận một giao dịch nhập kho (Import) hoặc xuất kho (Export).
 * Dùng để kiểm kê, theo dõi lịch sử thao tác và báo cáo nhập/xuất.
 */
const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'ID sản phẩm (productId) là bắt buộc.'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID người dùng (userId) là bắt buộc.'],
    },
    type: {
      type: String,
      required: [true, 'Loại giao dịch (type) là bắt buộc.'],
      enum: {
        values: ['Import', 'Export'],
        message: 'Loại giao dịch (type) phải là "Import" hoặc "Export".',
      },
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng (quantity) là bắt buộc.'],
      min: [1, 'Số lượng phải lớn hơn 0.'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'inventorylogs',
  }
);

// Index trên productId, userId, type và createdAt để tối ưu truy vấn theo nhiều chiều.
inventoryLogSchema.index({ productId: 1 });
inventoryLogSchema.index({ userId: 1 });
inventoryLogSchema.index({ createdAt: -1 }); // -1: sắp xếp giảm dần, mới nhất trước.
inventoryLogSchema.index({ type: 1 });

// Virtual mô tả giao dịch bằng ngôn ngữ tự nhiên.
inventoryLogSchema.virtual('moTaGiaoDich').get(function () {
  const loaiGiaoDich = this.type === 'Import' ? 'nhập kho' : 'xuất kho';
  return `${loaiGiaoDich} ${this.quantity} sản phẩm (ID: ${this.productId})`;
});

inventoryLogSchema.set('toJSON', { virtuals: true });
inventoryLogSchema.set('toObject', { virtuals: true });

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

module.exports = InventoryLog;
