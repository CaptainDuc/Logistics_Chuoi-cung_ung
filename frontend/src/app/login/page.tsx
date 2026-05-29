"use client";

import "./AuthForm.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      // Nếu Backend trả về success: false
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Đăng nhập thất bại");
      }

      // 🌟 KHỚP NỐI CHUẨN: Backend bọc dữ liệu trong thuộc tính 'data'
      const userData = result.data.user;
      const accessToken = result.data.accessToken;

      // Lưu lại các thông tin cần thiết vào localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("userRole", userData.role);
      localStorage.setItem("username", userData.username);

      alert(`Chào mừng ${userData.username} (${userData.role}) quay trở lại!`);

      // Đăng nhập thành công -> Chuyển hướng về trang quét mã QR chính
      router.push("/");

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* FORM LOGIN */}
      <div className="form-box">
        <form onSubmit={handleLogin}>
          <h1>Đăng Nhập</h1>
          <p>Đăng nhập để sử dụng hệ thống</p>

          {errorMsg && (
            <div style={{
              backgroundColor: "#ffebef",
              border: "1px solid #ffccd5",
              color: "#ff4d4f",
              padding: "10px",
              borderRadius: "10px",
              fontSize: "13px",
              marginBottom: "15px",
              fontWeight: "500"
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="input-box">
            <input 
              type="text" 
              placeholder="Tên đăng nhập (Username)" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              disabled={loading}
            />
          </div>

          <div className="input-box">
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              disabled={loading}
            />
          </div>

          <div className="forgot-link">
            <a href="#">Quên mật khẩu?</a>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Đang xác thực..." : "Đăng Nhập"}
          </button>
        </form>
      </div>

      {/* RIGHT PANEL */}
      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Welcome Back!</h1>
          <p>
            Logistics Management
            <br />
            QR Scanner System
          </p>
          <button type="button" className="btn">
            Explore
          </button>
        </div>
      </div>
    </div>
  );
}