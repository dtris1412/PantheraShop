import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/contexts/authContext"; // ✅ thêm dòng này

export default function Login() {
  const navigate = useNavigate();
  const { login, register, user } = useAuth(); // ✅ lấy từ context

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // dùng context login
        await login(formData.email, formData.password);

        // Kiểm tra role_id để điều hướng
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user.role_id === 0) {
            navigate("/admin"); // Admin -> admin dashboard
          } else {
            navigate("/"); // User thường -> home
          }
        }
      } else {
        // dùng context register
        await register(formData.username, formData.email, formData.password);
        navigate("/"); // Sau khi đăng ký -> home
      }
    } catch (err: any) {
      setError(err.message || "Internal error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-md mx-auto px-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto flex items-center justify-center mb-1">
            <img src="/assets/img/logo/logo_PantheraShop.png" alt="Logo" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản"}
          </h1>
          <p className="text-gray-600">
            {isLogin
              ? "Đăng nhập để truy cập tài khoản của bạn"
              : "Tham gia cùng chúng tôi để bắt đầu hành trình thể thao"}
          </p>
        </div>

        {error && (
          <div className="mb-4 text-red-600 font-medium text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="JohnDoe"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="email@.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-10 pr-12 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="••••••••"
                  required={!isLogin}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading
              ? "Đang xử lý..."
              : isLogin
              ? "Đăng nhập"
              : "Tạo tài khoản"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-black font-semibold hover:underline"
            >
              {isLogin ? "Đăng ký" : "Đăng nhập"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
