"use server";

// Định nghĩa kiểu dữ liệu Product chuẩn khớp với file seed.js của Backend
export interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  supplierId: string;
  location: string;
  createdAt?: string;
}

// 1. Hàm lấy danh sách tất cả sản phẩm (Đổ ra bảng ở trang danh mục)
export async function getProductsAction() {
  try {
    // Giả lập độ trễ mạng 600ms cho giống thật
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Dữ liệu giả lập lấy chuẩn từ file seed.js của bạn Backend
    const mockProducts: Product[] = [
      {
        _id: "prod-001",
        name: "Máy tính xách tay Dell XPS 13",
        sku: "LAP-DELL-XPS13-001",
        quantity: 20,
        minQuantity: 5,
        supplierId: "sup-abc",
        location: "Kệ A1 - Tầng 1",
      },
      {
        _id: "prod-002",
        name: "Chuột không dây Logitech MX Master 3S",
        sku: "MOU-LOGI-MX3S-002",
        quantity: 50,
        minQuantity: 20,
        supplierId: "sup-abc",
        location: "Kệ B3 - Tầng 1",
      },
      {
        _id: "prod-003",
        name: "Bàn phím cơ Keychron K8 Pro",
        sku: "KEY-KEYC-K8P-003",
        quantity: 0, // Hàng đã hết theo đúng file seed
        minQuantity: 10,
        supplierId: "sup-xyz",
        location: "Kệ C2 - Tầng 2",
      },
    ];

    return { success: true, data: mockProducts };
  } catch (error: any) {
    return { success: false, error: "Không thể tải danh sách sản phẩm" };
  }
}

// 2. Hàm giả lập thêm sản phẩm mới
export async function createProductAction(
  formData: Omit<Product, "_id" | "quantity">
) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Khi gọi API thật, đoạn này sẽ là fetch('.../api/products', { method: 'POST', body: formData })
    console.log("Dữ liệu gửi lên Backend thử nghiệm:", formData);

    return { success: true, message: "Thêm sản phẩm thành công (Mock)!" };
  } catch (error: any) {
    return { success: false, error: "Lỗi khi thêm sản phẩm" };
  }
}
