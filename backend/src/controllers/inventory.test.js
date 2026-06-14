// src/controllers/inventory.test.js
const { quetMaQR } = require("./inventoryController");
const Product = require("../models/Product");
const InventoryLog = require("../models/InventoryLog");

// Mock (giả lập) các Model của Mongoose để không làm ảnh hưởng tới Database thật khi test
jest.mock("../models/Product");
jest.mock("../models/InventoryLog");

describe("🧪 Unit Test: Inventory Controller - Hàm quetMaQR", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset lại trạng thái giả lập trước mỗi case test
    jest.clearAllMocks();

    // Giả lập cấu trúc request từ user (đã đăng nhập qua middleware auth)
    mockReq = {
      body: {},
      user: {
        _id: "user_admin_123",
        email: "admin@ptit.edu.vn",
        username: "admin_test",
        role: "Admin",
      },
    };

    // Giả lập response của Express với status và json trả về
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // =================================================================
  // FUNCTION TEST 1: NGHIỆP VỤ NHẬP KHO (IMPORT)
  // =================================================================
  test("1. Hàm nên CỘNG thêm số lượng vào kho thành công khi type là 'Import'", async () => {
    mockReq.body = { sku: "HUB-ANKER-01", type: "Import", quantity: 10 };

    // Giả lập sản phẩm đang có sẵn 50 cái trong kho
    const mockProduct = {
      _id: "prod_123",
      name: "Hub USB Anker",
      sku: "HUB-ANKER-01",
      quantity: 50,
      minQuantity: 10,
      save: jest.fn().mockResolvedValue(true),
    };

    Product.findOne.mockResolvedValue(mockProduct);
    InventoryLog.create.mockResolvedValue({ _id: "log_999" });

    await quetMaQR(mockReq, mockRes);

    // KỲ VỌNG LOGIC: 50 + 10 = 60 cái
    expect(mockProduct.quantity).toBe(60);
    expect(mockProduct.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("nhập kho thành công"),
      }),
    );
  });

  // =================================================================
  // FUNCTION TEST 2: NGHIỆP VỤ XUẤT KHO HỢP LỆ (EXPORT)
  // =================================================================
  test("2. Hàm nên TRỪ bớt số lượng trong kho thành công khi type là 'Export' và đủ hàng", async () => {
    mockReq.body = { sku: "HUB-ANKER-01", type: "Export", quantity: 15 };

    // Giả lập hàng đang có sẵn 50 cái
    const mockProduct = {
      _id: "prod_123",
      name: "Hub USB Anker",
      sku: "HUB-ANKER-01",
      quantity: 50,
      minQuantity: 10,
      save: jest.fn().mockResolvedValue(true),
    };

    Product.findOne.mockResolvedValue(mockProduct);
    InventoryLog.create.mockResolvedValue({ _id: "log_888" });

    await quetMaQR(mockReq, mockRes);

    // KỲ VỌNG LOGIC: 50 - 15 = 35 cái
    expect(mockProduct.quantity).toBe(35);
    expect(mockProduct.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("xuất kho thành công"),
      }),
    );
  });

  // =================================================================
  // FUNCTION TEST 3: CƠ CHẾ CHẶN XUẤT KHO KHI THIẾU HÀNG (VALIDATION)
  // =================================================================
  test("3. Hàm phải CHẶN và báo lỗi nếu số lượng xuất vượt quá số lượng hiện có trong kho", async () => {
    // Muốn xuất hẳn 100 cái trong khi kho chỉ có 50 cái
    mockReq.body = { sku: "HUB-ANKER-01", type: "Export", quantity: 100 };

    const mockProduct = {
      _id: "prod_123",
      name: "Hub USB Anker",
      sku: "HUB-ANKER-01",
      quantity: 50,
      minQuantity: 10,
      save: jest.fn(),
    };

    Product.findOne.mockResolvedValue(mockProduct);

    await quetMaQR(mockReq, mockRes);

    // KỲ VỌNG LOGIC: Số lượng tồn kho cũ (50) giữ nguyên không đổi, ko được gọi hàm lưu và trả về lỗi 400
    expect(mockProduct.quantity).toBe(50);
    expect(mockProduct.save).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("vượt quá số lượng tồn kho hiện tại"),
      }),
    );
  });
});
