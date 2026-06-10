// src/app/login/page.tsx
"use client";

import style from "./login.module.css";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/store/useToastStore";
import { getApiErrorMessage } from "@/lib/apiError";
import { backendBaseUrl } from "@/lib/api";

const loginSchema = z.object({
  username: z.string().min(3, { message: "Tên đăng nhập ít nhất 3 ký tự" }),
  password: z.string().min(6, { message: "Mật khẩu ít nhất 6 ký tự" }),
});

const API_URL = backendBaseUrl.endsWith('/api') ? backendBaseUrl : `${backendBaseUrl}/api`;

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
    <main className={style.loginContainer}>
      <div className={style.overlay} />

      <div className={style.glassCard}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-3xl text-center font-bold tracking-tight mb-8 text-white">
            Login
          </h1>

          {/* Error Message */}
          <div className="h-10">
            {loginError && (
              <div className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-xl text-center text-sm text-rose-200">
                {loginError}
              </div>
            )}
          </div>

          {/* Username Input */}
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
          <br />
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
          <br />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[45px] bg-white rounded-[40px] text-base text-[#333] font-semibold hover:bg-white/90 transition-all"
          >
            {isSubmitting ? "Processing..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
