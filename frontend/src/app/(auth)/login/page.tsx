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
    setValue, // Dùng để cập nhật giá trị đã lọc sạch dấu cách vào React Hook Form
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // HÀM BẢO BỐI: Loại bỏ khoảng trắng ngay lập tức và giữ nguyên vị trí con trỏ chuột
  const handleInputChangeNoSpace = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "username" | "password"
  ) => {
    const input = e.target;
    const rawValue = input.value;

    // 1. Lưu lại vị trí con trỏ hiện tại trước khi xử lý chuỗi
    const startCursor = input.selectionStart || 0;

    // 2. Nếu phát hiện có bất kỳ dấu cách/khoảng trắng nào (\s)
    if (/\s/.test(rawValue)) {
      // Loại bỏ toàn bộ khoảng trắng thừa
      const cleanValue = rawValue.replace(/\s/g, "");

      // Đồng bộ giá trị sạch vào React Hook Form
      setValue(fieldName, cleanValue, { shouldValidate: true });

      // 3. Đợi React cập nhật DOM ngầm, ép con trỏ đứng yên đúng vị trí cũ thay vì bay về cuối dòng
      setTimeout(() => {
        const newCursorPosition = startCursor - 1;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    } else {
      // Nếu không có dấu cách, cập nhật giá trị bình thường
      setValue(fieldName, rawValue, { shouldValidate: true });
    }
  };

  // LOGIC ĐĂNG NHẬP GIẢ LẬP KHI CHƯA CÓ BACKEND
  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Dữ liệu đăng nhập giả lập:", data);

      if (data.username === "admin" && data.password === "123456") {
        const fakeToken = "mock_token_logistics_2026_captain_duc";
        document.cookie = `auth_token=${fakeToken}; path=/; max-age=86400; SameSite=Strict`;

        router.push("/dashboard");
        router.refresh();
      } else {
        throw new Error(
          "Tài khoản hoặc mật khẩu không chính xác! (Gợi ý tài khoản test: admin / 123456)"
        );
      }
    } catch (error: any) {
      console.error("Lỗi đăng nhập phát sinh:", error);
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

      {/* Khung form Glassmorphism */}
      <div className="relative z-10 w-[420px] bg-transparent border-2 border-white/20 backdrop-blur-[15px] shadow-[0_0_10px_rgba(0,0,0,0.2)] text-white rounded-[16px] py-8 px-10 mx-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-3xl text-center font-bold font-['Poppins'] tracking-tight">
            Login
          </h1>

          {/* HIỂN THỊ LỖI ĐĂNG NHẬP */}
          {loginError && (
            <div className="mt-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-center text-sm text-rose-200 font-medium">
              {loginError}
            </div>
          )}

          {/* Input Box (Username) */}
          <div className="relative w-full h-[50px] mt-6 mb-2">
            <input
              type="text"
              placeholder="Username"
              {...register("username")} // Giữ nguyên đăng ký để validation hoạt động
              onChange={(e) => handleInputChangeNoSpace(e, "username")} // Đè hàm onChange tùy biến lên trên
              className="w-full h-full bg-transparent border-2 border-white/20 rounded-[40px] text-base text-white py-5 pl-5 pr-11 placeholder:text-white/60 outline-none focus:border-white/60 transition-all"
            />
            <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
          </div>
          {errors.username && (
            <p className="text-xs text-rose-400 mb-4 ml-4 font-medium">
              {errors.username.message}
            </p>
          )}

          {/* Input Box (Password) */}
          <div className="relative w-full h-[50px] mt-6 mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password")} // Giữ nguyên đăng ký để validation hoạt động
              onChange={(e) => handleInputChangeNoSpace(e, "password")} // Đè hàm onChange tùy biến lên trên
              className="w-full h-full bg-transparent border-2 border-white/20 rounded-[40px] text-base text-white py-5 pl-5 pr-11 placeholder:text-white/60 outline-none focus:border-white/60 transition-all"
            />
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

          {/* Remember Me & Forgot Password */}
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

          {/* Nút bấm Đăng Nhập */}
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

          {/* Link Đăng Ký */}
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
