import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";

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

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserDetailModal = ({ isOpen, onClose, user }: UserDetailModalProps) => {
  if (!isOpen || !user) return null;

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

  const getRoleColor = (role_id: number) => {
    switch (role_id) {
      case 0:
        return "bg-black text-white";
      case 1:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-black">Chi tiết người dùng</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.user_name}
                className="w-24 h-24 object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 bg-black text-white flex items-center justify-center text-3xl font-bold">
                {user.user_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-black mb-2">
                {user.user_name}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-3 py-1 text-xs font-medium ${getRoleColor(
                    user.role_id
                  )}`}
                >
                  {getRoleName(user.role_id)}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-medium flex items-center gap-1 ${
                    user.user_status
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.user_status ? (
                    <>
                      <CheckCircle size={12} />
                      Hoạt động
                    </>
                  ) : (
                    <>
                      <XCircle size={12} />
                      Tạm khóa
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Detail Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-black">Thông tin chi tiết</h4>

            {/* User ID */}
            <div className="flex items-start gap-3 p-4 bg-gray-50">
              <UserIcon size={20} className="text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  ID người dùng
                </p>
                <p className="text-base text-black font-medium">
                  #{user.user_id}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 p-4 bg-gray-50">
              <Mail size={20} className="text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                <p className="text-base text-black">{user.user_email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 p-4 bg-gray-50">
              <Phone size={20} className="text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Số điện thoại
                </p>
                <p className="text-base text-black">
                  {user.user_phone || (
                    <span className="text-gray-400">Chưa cập nhật</span>
                  )}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 p-4 bg-gray-50">
              <MapPin size={20} className="text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Địa chỉ
                </p>
                <p className="text-base text-black">
                  {user.user_address || (
                    <span className="text-gray-400">Chưa cập nhật</span>
                  )}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-3 p-4 bg-gray-50">
              <Shield size={20} className="text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Vai trò
                </p>
                <p className="text-base text-black">
                  {getRoleName(user.role_id)}
                </p>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-start gap-3 p-4 bg-gray-50">
              <Calendar size={20} className="text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Ngày tham gia
                </p>
                <p className="text-base text-black">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-black text-white font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
