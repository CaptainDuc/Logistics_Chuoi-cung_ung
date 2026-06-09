/**
 * Cấu hình Swagger / OpenAPI cho Smart WMS API.
 * Truy cập tài liệu tại: /api-docs
 */
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart WMS - Quản Lý Kho Hàng API",
      version: "1.0.0",
      description:
        "API documentation cho hệ thống Quản lý Kho hàng thông minh (Smart WMS). " +
        "Hỗ trợ: CRUD sản phẩm, nhập/xuất kho, quản lý tài khoản, xác thực JWT.",
      contact: {
        name: "Hỗ trợ kỹ thuật",
        email: "ducthinhn@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            'Nhập Access Token nhận được khi đăng nhập. Ví dụ: "Bearer eyJhbGci..."',
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            username: { type: "string", example: "admin" },
            role: {
              type: "string",
              enum: ["Admin", "User"],
              example: "Admin",
            },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d2" },
            name: { type: "string", example: "Máy tính xách tay Dell XPS 13" },
            sku: { type: "string", example: "LAP-DELL-XPS13-001" },
            quantity: { type: "integer", example: 50 },
            minQuantity: { type: "integer", example: 10 },
            location: { type: "string", example: "Kệ A1 - Tầng 1" },
            trangThaiTonKho: {
              type: "string",
              enum: ["Còn hàng", "Sắp hết - Cần nhập thêm", "Hết hàng"],
            },
            supplierId: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
                contactName: { type: "string" },
                phone: { type: "string" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        InventoryLog: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d3" },
            productId: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
                sku: { type: "string" },
              },
            },
            userId: {
              type: "object",
              properties: {
                _id: { type: "string" },
                username: { type: "string" },
                role: { type: "string" },
              },
            },
            type: {
              type: "string",
              enum: ["Import", "Export"],
              example: "Import",
            },
            quantity: { type: "integer", example: 20 },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string", example: "admin" },
            password: { type: "string", example: "123456" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string", example: "newuser" },
            password: { type: "string", example: "123456" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Thao tác thành công." },
            data: { type: "object", description: "Dữ liệu trả về (tùy API)" },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            currentPage: { type: "integer", example: 1 },
            totalPages: { type: "integer", example: 5 },
            totalItems: { type: "integer", example: 100 },
            itemsPerPage: { type: "integer", example: 20 },
            hasNextPage: { type: "boolean" },
            hasPrevPage: { type: "boolean" },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Xác thực & Quản lý phiên đăng nhập" },
      { name: "Products", description: "CRUD Sản phẩm trong kho" },
      {
        name: "Inventory",
        description: "Nhập kho, xuất kho, lịch sử & báo cáo",
      },
      { name: "Users", description: "Quản lý tài khoản người dùng (Admin)" },
    ],
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
