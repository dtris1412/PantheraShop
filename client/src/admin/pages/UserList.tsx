import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Mail,
  Phone,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Lock,
  Unlock,
} from "lucide-react";
import { useAdmin } from "../contexts/adminContext";
import CreateUserForm from "../components/UserComponents/CreateUserForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { showToast } from "../../shared/components/Toast";

interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  user_address: string | null;
  role_id: number;
  created_at: string | null;
  avatar: string | null;
  user_status: boolean;
}

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    type: "danger" | "warning" | "info";
  }>({
    title: "",
    message: "",
    onConfirm: async () => {},
    type: "warning",
  });
  const { getAllUsers, updateUserStatus, loading } = useAdmin();
  const itemsPerPage = 10;

  // Fetch users on mount ONLY ONCE
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        const sortedData = data.sort((a, b) => a.role_id - b.role_id);
        setUsers(sortedData);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        showToast("Không thể tải danh sách người dùng", "error");
      }
    };

    fetchUsers();
  }, []);

  const handleCreateSuccess = async () => {
    try {
      const data = await getAllUsers();
      const sortedData = data.sort((a, b) => a.role_id - b.role_id);
      setUsers(sortedData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showToast("Không thể làm mới danh sách người dùng", "error");
    }
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>,
    type: "danger" | "warning" | "info" = "warning"
  ) => {
    setConfirmConfig({ title, message, onConfirm, type });
    setShowConfirmDialog(true);
  };

  const executeStatusChange = async (
    userId: number,
    shouldLock?: boolean
  ): Promise<void> => {
    try {
      const result = await updateUserStatus(userId, shouldLock);

      if (result.user) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === userId
              ? { ...user, user_status: result.user.user_status }
              : user
          )
        );
      }

      showToast(result.message || "Cập nhật trạng thái thành công!", "success");
    } catch (error: any) {
      console.error("Failed to update user status:", error);
      showToast(
        error.message || "Có lỗi xảy ra khi cập nhật trạng thái",
        "error"
      );
    }
  };

  const handleToggleClick = (
    e: React.MouseEvent,
    userId: number,
    userName: string,
    currentStatus: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const action = currentStatus ? "khóa" : "mở khóa";
    showConfirm(
      "Xác nhận thay đổi trạng thái",
      `Bạn có chắc chắn muốn ${action} tài khoản "${userName}"?`,
      async () => await executeStatusChange(userId),
      currentStatus ? "warning" : "info"
    );
  };

  const handleLockClick = (
    e: React.MouseEvent,
    userId: number,
    userName: string,
    currentStatus: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const action = currentStatus ? "khóa" : "mở khóa";
    const shouldLock = currentStatus;

    showConfirm(
      `${action === "khóa" ? "Khóa" : "Mở khóa"} tài khoản`,
      `Bạn có chắc chắn muốn ${action} tài khoản "${userName}"?${
        action === "khóa"
          ? "\n\nTài khoản sẽ không thể đăng nhập sau khi bị khóa."
          : ""
      }`,
      async () => await executeStatusChange(userId, shouldLock),
      currentStatus ? "danger" : "info"
    );
  };

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

  const getStatusInfo = (status: boolean) => {
    return status
      ? { name: "Hoạt động", color: "bg-green-100 text-green-800" }
      : { name: "Tạm khóa", color: "bg-red-100 text-red-800" };
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.user_phone && user.user_phone.includes(searchTerm));

    const matchRole =
      roleFilter === "" || user.role_id.toString() === roleFilter;

    const matchStatus =
      statusFilter === "" || user.user_status.toString() === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin và quyền hạn người dùng
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white hover:bg-gray-800 transition-colors duration-200"
        >
          <Plus size={20} />
          <span className="font-medium">Thêm người dùng</span>
        </button>
      </div>

      <div className="bg-white p-4 border border-gray-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 relative min-w-80">
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

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-200"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Tạm khóa</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-black">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter((u) => u.user_status).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tạm khóa</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter((u) => !u.user_status).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admin</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter((u) => u.role_id === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

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
          <div className="bg-white border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Liên hệ</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Trạng thái</th>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 text-xs font-medium ${
                            getStatusInfo(user.user_status).color
                          }`}
                        >
                          {getStatusInfo(user.user_status).name}
                        </span>

                        <button
                          type="button"
                          onClick={(e) =>
                            handleToggleClick(
                              e,
                              user.user_id,
                              user.user_name,
                              user.user_status
                            )
                          }
                          className={`p-1 hover:bg-gray-100 transition-colors duration-200 ${
                            user.role_id === 0
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={user.role_id === 0}
                          title={
                            user.role_id === 0
                              ? "Không thể thay đổi trạng thái Admin"
                              : user.user_status
                              ? "Click để khóa tài khoản"
                              : "Click để mở khóa tài khoản"
                          }
                        >
                          {user.user_status ? (
                            <ToggleRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-100 transition-colors duration-200"
                          title="Chỉnh sửa người dùng"
                        >
                          <Edit size={16} className="text-gray-600" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) =>
                            handleLockClick(
                              e,
                              user.user_id,
                              user.user_name,
                              user.user_status
                            )
                          }
                          className={`p-2 transition-colors duration-200 ${
                            user.role_id === 0
                              ? "opacity-50 cursor-not-allowed"
                              : user.user_status
                              ? "hover:bg-red-50"
                              : "hover:bg-green-50"
                          }`}
                          disabled={user.role_id === 0}
                          title={
                            user.role_id === 0
                              ? "Không thể thay đổi trạng thái Admin"
                              : user.user_status
                              ? "Khóa tài khoản"
                              : "Mở khóa tài khoản"
                          }
                        >
                          {user.user_status ? (
                            <Lock size={16} className="text-red-600" />
                          ) : (
                            <Unlock size={16} className="text-green-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
                  type="button"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      type="button"
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
                  type="button"
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

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={async () => {
          await confirmConfig.onConfirm();
          setShowConfirmDialog(false);
        }}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />

      <CreateUserForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default UserList;
