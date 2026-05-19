/**
 * Schema cho collection "suppliers" — nhà cung cấp hàng hóa cho kho.
 */
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên nhà cung cấp (name) là bắt buộc.'],
      trim: true,
      minlength: [2, 'Tên nhà cung cấp phải có ít nhất 2 ký tự.'],
      maxlength: [100, 'Tên nhà cung cấp không được vượt quá 100 ký tự.'],
    },
    contactName: {
      type: String,
      trim: true,
      maxlength: [100, 'Tên người liên hệ không được vượt quá 100 ký tự.'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true, // Chuẩn hóa email về chữ thường trước khi lưu.
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Địa chỉ email không hợp lệ.',
      ],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Số điện thoại không được vượt quá 20 ký tự.'],
    },
  },
  {
    timestamps: true,
    collection: 'suppliers',
  }
);

supplierSchema.index({ name: 1 });

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
