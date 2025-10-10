import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { useAuth } from "../contexts/authContext";

// ✅ Định nghĩa kiểu dữ liệu cho user
interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  role_id: number;
  avatar?: string;
}

export default function Profile() {
  const { token, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // ✅ Khai báo kiểu cho useState
  const [user, setUser] = useState<User | null>(null);
  const [fetching, setFetching] = useState(true);

  // ✅ Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  // ✅ Lấy thông tin profile từ backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await fetch("http://localhost:8080/api/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // token hết hạn hoặc lỗi
          logout();
          navigate("/login");
          return;
        }

        const data: User = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setFetching(false);
      }
    };

    if (isAuthenticated && token) {
      fetchProfile();
    }
  }, [isAuthenticated, token, logout, navigate]);

  // ✅ Hiển thị loading trong khi đang fetch
  if (loading || fetching) return <Loading />;

  // ✅ Nếu không có user thì không render
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full mx-auto object-cover border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
              {user.user_name?.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold mt-4">{user.user_name}</h1>
          <p className="text-gray-600">{user.user_email}</p>
          <p className="text-sm text-gray-500 mt-1">
            {user.role_id === 1 ? "Admin" : "Khách hàng"}
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="font-medium">User ID:</span>
            <span>{user.user_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Role ID:</span>
            <span>{user.role_id}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-100 py-2 rounded hover:bg-gray-200 transition"
          >
            Quay về trang chủ
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
