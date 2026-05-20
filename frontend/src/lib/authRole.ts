/** Đọc role từ localStorage (đồng bộ với luồng login hiện tại). */
export function readUserRole(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("userRole") || "";
}

export function isAdminUser(): boolean {
  return readUserRole() === "Admin";
}
