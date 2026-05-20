// src/app/login/page.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/store/useToastStore";
import { getApiErrorMessage } from "@/lib/apiError";

const loginSchema = z.object({
  username: z.string().min(3, { message: "Tên đăng nhập ít nhất 3 ký tự" }),
  password: z.string().min(6, { message: "Mật khẩu ít nhất 6 ký tự" }),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToastStore((s) => s.show);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleInputChangeNoSpace = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "username" | "password"
  ) => {
    const rawValue = e.target.value;
    if (/\s/.test(rawValue)) {
      setValue(fieldName, rawValue.replace(/\s/g, ""), {
        shouldValidate: true,
      });
    } else {
      setValue(fieldName, rawValue, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data);

      const token = response.data.data.accessToken;
      const refreshToken = response.data.data.refreshToken;
      const user = response.data.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      document.cookie = `token=${token}; path=/`;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userRole", user?.role || "");
      localStorage.setItem("userName", user?.username || "");

      toast("Đăng nhập thành công.", "success");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Lỗi đăng nhập:", error);
      setLoginError(
        getApiErrorMessage(error, "Đăng nhập thất bại, vui lòng thử lại.")
      );
    }
  };

  return (
    <div
      className="font-['Poppins',_sans-serif] flex justify-center items-center min-h-screen relative w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://i.pinimg.com/originals/d7/b9/0c/d7b90cc80898e8823455a127945719af.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 w-[420px] bg-transparent border-2 border-white/20 backdrop-blur-[15px] shadow-[0_0_10px_rgba(0,0,0,0.2)] text-white rounded-[16px] py-10 px-10 mx-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-3xl text-center font-bold tracking-tight">
            Login
          </h1>

          {loginError && (
            <div className="mt-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-center text-sm text-rose-200 font-medium">
              {loginError}
            </div>
          )}

          <div className="relative w-full h-[50px] mt-6 mb-2">
            <input
              type="text"
              placeholder="Username"
              disabled={isSubmitting}
              {...register("username")}
              onChange={(e) => handleInputChangeNoSpace(e, "username")}
              className="w-full h-full bg-transparent border-2 border-white/20 rounded-[40px] text-base text-white py-5 pl-5 pr-11 placeholder:text-white/60 outline-none focus:border-white/60"
            />
            <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
          </div>
          {errors.username && (
            <p className="text-xs text-rose-400 mb-4 ml-4">
              {errors.username.message}
            </p>
          )}

          <div className="relative w-full h-[50px] mt-4 mb-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              disabled={isSubmitting}
              {...register("password")}
              onChange={(e) => handleInputChangeNoSpace(e, "password")}
              className="w-full h-full bg-transparent border-2 border-white/20 rounded-[40px] text-base text-white py-5 pl-5 pr-11 placeholder:text-white/60 outline-none focus:border-white/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-white" />
              ) : (
                <Eye className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-400 mb-4 ml-4">
              {errors.password.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[45px] bg-white rounded-[40px] text-base text-[#333] font-semibold flex items-center justify-center space-x-2 hover:bg-white/90 active:scale-[0.99] disabled:bg-white/70"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-[#333]/30 border-t-[#333] rounded-full animate-spin"></div>
            )}
            <span>{isSubmitting ? "Processing..." : "Login"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
