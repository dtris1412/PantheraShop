import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { useAdmin } from "../contexts/adminContext";

interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  user_address: string | null;
  role_id: number;
  created_at: string | null;
  avatar: string | null;
}

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { getAllUsers, loading } = useAdmin();
  const itemsPerPage = 10;

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        // Sort by role_id ascending (0 = Admin first)
        const sortedData = data.sort((a, b) => a.role_id - b.role_id);
        setUsers(sortedData);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Get role name
  const getRoleName = (role_id: number) => {
    switch (role_id) {
      case 0:
        return "Admin";
      case 1:
        return "Nhân viên";
      case 2:
        return "Khách hàng";
      default:
        return "Khách hàng";
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.user_phone && user.user_phone.includes(searchTerm));

    const matchRole =
      roleFilter === "" || user.role_id.toString() === roleFilter;

    return matchSearch && matchRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin và quyền hạn người dùng
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-black text-white hover:bg-gray-800 transition-colors duration-200">
          <Plus size={20} />
          <span className="font-medium">Thêm người dùng</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-200"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-200"
          >
            <option value="">Tất cả vai trò</option>
            <option value="0">Admin</option>
            <option value="1">Nhân viên</option>
            <option value="2">Khách hàng</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-2 text-lg font-medium">
            Không tìm thấy người dùng
          </div>
          <div className="text-sm text-gray-500">
            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Liên hệ</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Ngày tham gia</th>
                  <th className="px-6 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr
                    key={user.user_id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.user_name}
                            className="w-10 h-10 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-medium">
                            {user.user_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-black">
                            {user.user_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: #{user.user_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          <span>{user.user_email}</span>
                        </div>
                        {user.user_phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} />
                            <span>{user.user_phone}</span>
                          </div>
                        )}
                        {user.user_address && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin size={14} />
                            <span className="truncate max-w-xs">
                              {user.user_address}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium ${
                          user.role_id === 0
                            ? "bg-black text-white"
                            : user.role_id === 1
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getRoleName(user.role_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 transition-colors duration-200">
                          <Edit size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-red-50 transition-colors duration-200">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-medium">
                  {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}
                </span>{" "}
                của <span className="font-medium">{filteredUsers.length}</span>{" "}
                người dùng
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                        currentPage === page
                          ? "bg-black text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserList;
