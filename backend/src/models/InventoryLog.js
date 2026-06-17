/**
 * Schema cho collection "inventorylogs" — lịch sử nhập/xuất kho.
 * Mỗi document ghi nhận một giao dịch nhập kho (Import) hoặc xuất kho (Export).
 * Đã tích hợp liên kết thực thể Khách hàng/Đại lý phục vụ xuất kho.
 */
const mongoose = require("mongoose");

const inventoryLogSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "ID sản phẩm (productId) là bắt buộc."],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ID người dùng (userId) là bắt buộc."],
    },
    type: {
      type: String,
      required: [true, "Loại giao dịch (type) là bắt buộc."],
      enum: {
        values: ["Import", "Export"],
        message: 'Loại giao dịch (type) phải là "Import" hoặc "Export".',
      },
    },
    quantity: {
      type: Number,
      required: [true, "Số lượng (quantity) là bắt buộc."],
      min: [1, "Số lượng phải lớn hơn 0."],
    },
    // Giữ lại tên text thuần để dự phòng khi nhập nhanh không chọn danh mục
    customerName: {
      type: String,
      trim: true,
      default: "",
    },
    // MỚI: Liên kết ID trực tiếp sang bảng đại lý / khách hàng khi xuất kho
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "inventorylogs",
  },
);

// Index để tối ưu hiệu năng truy vấn báo cáo dữ liệu lớn
inventoryLogSchema.index({ productId: 1 });
inventoryLogSchema.index({ userId: 1 });
inventoryLogSchema.index({ customerId: 1 }); // MỚI: Index tìm kiếm theo lịch sử mua hàng của khách
inventoryLogSchema.index({ createdAt: -1 }); // Mới nhất lên đầu
inventoryLogSchema.index({ type: 1 });

// Virtual mô tả giao dịch tự động bằng tiếng Việt
inventoryLogSchema.virtual("moTaGiaoDich").get(function () {
  const loaiGiaoDich = this.type === "Import" ? "nhập kho" : "xuất kho";
  const doiTac = this.customerName ? ` cho ${this.customerName}` : "";
  return `Đã ${loaiGiaoDich} ${this.quantity} sản phẩm${doiTac}`;
});

inventoryLogSchema.set("toJSON", { virtuals: true });
inventoryLogSchema.set("toObject", { virtuals: true });

const InventoryLog = mongoose.model("InventoryLog", inventoryLogSchema);

module.exports = InventoryLog;
