"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

// Định nghĩa Schema kiểm tra dữ liệu đầu vào với Zod
const loginSchema = z.object({
  username: z.string().min(3, { message: "Tên đăng nhập ít nhất 3 ký tự" }),
  password: z.string().min(6, { message: "Mật khẩu ít nhất 6 ký tự" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // LOGIC ĐĂNG NHẬP GIẢ LẬP KHI CHƯA CÓ BACKEND
  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null); // Xóa thông báo lỗi cũ nếu có trước khi bấm login lại

    try {
      // Giả lập hiệu ứng chờ phản hồi từ server trong 1.5 giây
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Dữ liệu đăng nhập giả lập:", data);

      // CẤU HÌNH TÀI KHOẢN GIẢ LẬP ĐỂ ĐỨC VÀ NHÓM TEST LUỒNG
      if (data.username === "admin" && data.password === "123456") {
        // 1. Tạo chuỗi token giả định cho hệ thống quản lý chuỗi cung ứng
        const fakeToken = "mock_token_logistics_2026_captain_duc";

        // 2. LƯU TOKEN VÀO COOKIE TRÌNH DUYỆT
        // Thời gian sống: 1 ngày (86400 giây). Path=/ áp dụng cho toàn bộ domain.
        document.cookie = `auth_token=${fakeToken}; path=/; max-age=86400; SameSite=Strict`;

        // 3. Đăng nhập thành công, mở cửa đẩy vào Dashboard
        router.push("/dashboard");
        router.refresh(); // Buộc router quét lại cookie để middleware.ts nhận diện ngay lập tức
      } else {
        // Gõ sai tài khoản mặc định thì ném lỗi ra khối catch để xử lý
        throw new Error(
          "Tài khoản hoặc mật khẩu không chính xác! (Gợi ý tài khoản test: admin / 123456)"
        );
      }
    } catch (error: any) {
      console.error("Lỗi đăng nhập phát sinh:", error);
      // Hiển thị thông báo lỗi thân thiện lên giao diện thay vì báo lỗi kết nối mạng
      setLoginError(error.message);
    }
  };

  return (
    <div
      className="font-['Poppins',_sans-serif] flex justify-center items-center min-h-screen relative w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://i.pinimg.com/originals/d7/b9/0c/d7b90cc80898e8823455a127945719af.jpg')`,
      }}
    >
      {/* LỚP PHỦ TỐI */}
      <div className="absolute inset-0 bg-black/20 z-0"></div>

      {/* .wrapper: Khung form Glassmorphism */}
      <div className="relative z-10 w-[420px] bg-transparent border-2 border-white/20 backdrop-blur-[15px] shadow-[0_0_10px_rgba(0,0,0,0.2)] text-white rounded-[16px] py-8 px-10 mx-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-3xl text-center font-bold font-['Poppins'] tracking-tight">
            Login
          </h1>

          {/* HIỂN THỊ LỖI ĐĂNG NHẬP (Báo sai mật khẩu hoặc lỗi hệ thống) */}
          {loginError && (
            <div className="mt-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-center text-sm text-rose-200 font-medium">
              {loginError}
            </div>
          )}

          {/* .input-box (Username) */}
          <div className="relative w-full h-[50px] mt-6 mb-2">
            <input
              type="text"
              placeholder="Username"
              {...register("username")}
              className="w-full h-full bg-transparent border-2 border-white/20 rounded-[40px] text-base text-white py-5 pl-5 pr-11 placeholder:text-white/60 outline-none focus:border-white/60 transition-all"
            />
            <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
          </div>
          {errors.username && (
            <p className="text-xs text-rose-400 mb-4 ml-4 font-medium">
              {errors.username.message}
            </p>
          )}

          {/* .input-box (Password) */}
          <div className="relative w-full h-[50px] mt-6 mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password")}
              className="w-full h-full bg-transparent border-2 border-white/20 rounded-[40px] text-base text-white py-5 pl-5 pr-11 placeholder:text-white/60 outline-none focus:border-white/60 transition-all"
            />
            {/* Nút bật/tắt hiển thị mật khẩu lồng vào vị trí của icon khóa */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 focus:outline-none hover:text-white/80 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-white" />
              ) : (
                <Lock className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-400 mb-4 ml-4 font-medium">
              {errors.password.message}
            </p>
          )}

          {/* .remember-forgot */}
          <div className="flex justify-between text-sm mt-2 mx-0 mb-[15px] pt-2 px-1">
            <label className="flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-white mr-[6px] w-4 h-4 rounded border-white/20 bg-transparent"
              />
              Remember me
            </label>
            <a href="#" className="text-white no-underline hover:underline">
              Forgot password?
            </a>
          </div>

          {/* .btn */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[45px] bg-white border-none outline-none rounded-[40px] shadow-[0_0_10px_rgba(0,0,0,0.1)] cursor-pointer text-base text-[#333] font-semibold flex items-center justify-center space-x-2 transition-all hover:bg-white/90 active:scale-[0.99] disabled:bg-white/70 disabled:cursor-not-allowed"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-[#333]/30 border-t-[#333] rounded-full animate-spin"></div>
            )}
            <span>{isSubmitting ? "Processing..." : "Login"}</span>
          </button>

          {/* .register-link */}
          <div className="text-sm text-center mt-5 mx-0 mb-0">
            <p>
              Don't have an account?{" "}
              <a
                href="#"
                className="text-white no-underline font-semibold hover:underline"
              >
                Register
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
