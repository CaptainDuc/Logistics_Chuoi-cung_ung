const nodemailer = require("nodemailer");

/**
 * Gửi email cảnh báo tồn kho
 * @param {string} toEmail - Email người nhận (Admin đang thao tác)
 * @param {object} product - Thông tin sản phẩm
 * @param {string} type - Loại cảnh báo: 'LOW_STOCK' hoặc 'OUT_OF_STOCK'
 */
const sendInventoryAlert = async (toEmail, product, type = "LOW_STOCK") => {
  try {
    // Chỉ khởi tạo transporter khi thực sự cần gửi mail
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const isOutOfStock = type === "OUT_OF_STOCK" || product.quantity <= 0;
    const recipient = toEmail || process.env.ADMIN_EMAIL;

    if (!recipient) {
      console.error("[Email] Không tìm thấy email người nhận hợp lệ.");
      return;
    }

    const subject = isOutOfStock
      ? `🚨 CẢNH BÁO KHẨN CẤP: Sản phẩm "${product.name}" đã HẾT HÀNG!`
      : `⚠️ CẢNH BÁO: Sản phẩm "${product.name}" sắp hết hàng!`;

    const statusText = isOutOfStock ? "ĐÃ HẾT HÀNG" : "SẮP HẾT HÀNG";
    const statusColor = isOutOfStock ? "#e74c3c" : "#f39c12";

    const mailOptions = {
      from: `"Hệ thống Quản lý Kho" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${statusText}</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Chào Admin, <br><br>
              Hệ thống ghi nhận sản phẩm sau đã chạm ngưỡng cảnh báo tồn kho:
            </p>
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 5px solid ${statusColor};">
              <p style="margin: 5px 0;"><strong>Sản phẩm:</strong> ${product.name}</p>
              <p style="margin: 5px 0;"><strong>Mã SKU:</strong> <code style="background-color: #eee; padding: 2px 5px; border-radius: 4px;">${product.sku}</code></p>
              <p style="margin: 5px 0;"><strong>Số lượng hiện tại:</strong> <span style="color: ${statusColor}; font-weight: bold; font-size: 18px;">${product.quantity}</span></p>
              <p style="margin: 5px 0;"><strong>Hạn mức cảnh báo:</strong> ${product.minQuantity}</p>
              <p style="margin: 5px 0;"><strong>Vị trí:</strong> ${product.location || "Chưa xác định"}</p>
            </div>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Vui lòng kiểm tra và thực hiện nhập thêm hàng để đảm bảo hoạt động kinh doanh không bị gián đoạn.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" 
                 style="background-color: #2c3e50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Xem Kho Ngay
              </a>
            </div>
          </div>
          <div style="background-color: #f1f1f1; padding: 15px; text-align: center; color: #777; font-size: 12px;">
            Email tự động từ Logistics Chuỗi Cung Ứng. Vui lòng không phản hồi email này.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Success] Đã gửi cảnh báo ${statusText} cho ${recipient} (Sản phẩm: ${product.name})`);
  } catch (error) {
    console.error("[Email Error] Lỗi khi gửi email:", error.message);
  }
};

module.exports = {
  sendInventoryAlert,
};
