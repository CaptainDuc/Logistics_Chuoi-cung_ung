import axios from "axios";

/**
 * Lấy message lỗi thân thiện từ response API (Express thường trả { success, message }).
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Đã có lỗi xảy ra. Vui lòng thử lại."
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message && typeof data.message === "string") {
      return data.message;
    }
    const status = error.response?.status;
    if (status === 403) {
      return "Bạn không có quyền thực hiện thao tác này.";
    }
    if (status === 404) {
      return "Không tìm thấy dữ liệu.";
    }
    if (status === 401) {
      return "Phiên đăng nhập đã hết hạn hoặc không hợp lệ.";
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

/** Đọc message từ response fetch khi status không OK (JSON API). */
export async function getFetchErrorMessage(
  response: Response,
  fallback = "Yêu cầu không thành công."
): Promise<string> {
  if (response.status === 403) {
    return "Chỉ tài khoản Admin mới được xuất Excel.";
  }
  const ct = response.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    if (data?.message && typeof data.message === "string") {
      return data.message;
    }
  }
  return fallback;
}
