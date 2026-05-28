
"use client";

import "./AuthForm.css";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    alert("Đăng nhập thành công");

    router.push("/dashboard");
  };

  return (
    <div className="container">
      {/* FORM LOGIN */}
      <div className="form-box">
        <form onSubmit={handleLogin}>
          <h1>Đăng Nhập</h1>

          <p>Đăng nhập để sử dụng hệ thống</p>

          <div className="input-box">
            <input type="email" placeholder="Email" required />
          </div>

          <div className="input-box">
            <input type="password" placeholder="Mật khẩu" required />
          </div>

          <div className="forgot-link">
            <a href="#">Quên mật khẩu?</a>
          </div>

          <button type="submit" className="btn">
            Đăng Nhập
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

