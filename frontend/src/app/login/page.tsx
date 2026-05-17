export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">

        <h1 className="text-2xl font-bold text-center mb-6">
          Đăng nhập kho
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button className="w-full bg-black text-white py-3 rounded-lg">
          Đăng nhập
        </button>

      </div>
    </div>
  );
}