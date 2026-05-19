"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { backendFetch, setStoredAccessToken, setStoredRefreshToken } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await backendFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      } else {
        setStoredAccessToken(data.data.accessToken);
        setStoredRefreshToken(data.data.refreshToken);
        setMessage('Đăng nhập thành công! Chuyển sang trang quét...');
        window.setTimeout(() => router.push('/scan'), 600);
      }
    } catch (error) {
      setMessage('Không thể kết nối đến backend. Kiểm tra đường truyền và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="mx-auto w-full max-w-sm rounded-[28px] border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl shadow-cyan-500/10">
        <h1 className="text-center text-3xl font-semibold text-cyan-200">Đăng nhập nhân viên</h1>
        <p className="mt-3 text-center text-sm text-slate-400">Dùng tài khoản kho để truy cập tính năng quét mã QR.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              type="text"
              placeholder="admin"
              className="mt-2 w-full rounded-3xl border border-slate-700/90 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Mật khẩu</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-3xl border border-slate-700/90 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          {message ? (
            <div className="rounded-3xl bg-slate-800 px-4 py-3 text-sm text-slate-200">{message}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-cyan-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-5 rounded-3xl bg-slate-800/90 px-4 py-4 text-sm text-slate-400">
          <p>Test account:</p>
          <p className="mt-1">Username: admin</p>
          <p>Mật khẩu: 123456</p>
        </div>
      </div>
    </div>
  );
}
