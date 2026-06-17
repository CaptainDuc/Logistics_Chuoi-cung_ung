const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên đại lý / khách hàng là bắt buộc."],
      trim: true,
      unique: true, // Tránh tạo trùng lặp tên đại lý gây nhiễu dữ liệu báo cáo
    },
    contactName: {
      type: String,
      trim: true,
      default: "", // Tên người đại diện lấy hàng
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "", // Địa chỉ đại lý để sau này làm phiếu xuất kho giao hàng
    },
  },
  {
    timestamps: true, // Tự động tạo trường createdAt và updatedAt
  },
);

module.exports = mongoose.model("Customer", CustomerSchema);
