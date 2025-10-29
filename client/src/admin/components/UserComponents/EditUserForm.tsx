import { useState, useRef, useEffect } from "react";
import { X, User, Mail, Phone, MapPin, Shield, Camera } from "lucide-react";
import { useAdmin } from "../../contexts/adminContext";
import { showToast } from "../../../shared/components/Toast";

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

interface EditUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

interface FormData {
  user_name: string;
  user_email: string;
  user_phone: string;
  user_address: string;
  role_id: number;
  avatar?: string;
}

const EditUserForm = ({
  isOpen,
  onClose,
  onSuccess,
  user,
}: EditUserFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    user_name: "",
    user_email: "",
    user_phone: "",
    user_address: "",
    role_id: 2,
    avatar: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, updateUser } = useAdmin();

  useEffect(() => {
    if (user) {
      setFormData({
        user_name: user.user_name,
        user_email: user.user_email,
        user_phone: user.user_phone || "",
        user_address: user.user_address || "",
        role_id: user.user_id,
        avatar: user.avatar || "",
      });
      setAvatarPreview(user.avatar || "");
      setAvatarFile(null); // Reset file when user changes
    }
  }, [user]);

  // Handle avatar selection - Only preview, don't upload yet
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      const errorMsg = "Vui lòng chọn file ảnh";
      setErrors({ ...errors, avatar: errorMsg });
      showToast(errorMsg, "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = "File ảnh không được vượt quá 5MB";
      setErrors({ ...errors, avatar: errorMsg });
      showToast(errorMsg, "error");
      return;
    }

    // Store file and create preview
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Clear avatar error if exists
    if (errors.avatar) {
      setErrors((prev) => ({ ...prev, avatar: "" }));
    }

    showToast("Đã chọn ảnh, sẽ upload khi lưu thay đổi", "info");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_name.trim()) {
      newErrors.user_name = "Tên người dùng là bắt buộc";
    }

    if (!formData.user_email.trim()) {
      newErrors.user_email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      newErrors.user_email = "Email không đúng định dạng";
    }

    if (formData.user_phone && !/^\d{9,11}$/.test(formData.user_phone)) {
      newErrors.user_phone = "Số điện thoại phải có 9-11 chữ số";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      showToast(firstError, "error");
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setSubmitting(true);
    showToast("Đang cập nhật thông tin...", "info");

    try {
      let avatarUrl = formData.avatar;

      // Upload new avatar if file is selected
      if (avatarFile) {
        showToast("Đang upload avatar...", "info");
        try {
          avatarUrl = await uploadAvatar(avatarFile);
          showToast("Upload avatar thành công!", "success");
        } catch (error: any) {
          throw new Error("Upload avatar thất bại: " + error.message);
        }
      }

      // Update user with new data
      await updateUser(user.user_id, {
        user_name: formData.user_name,
        user_email: formData.user_email,
        user_phone: formData.user_phone || null,
        user_address: formData.user_address || null,
        role_id: formData.role_id,
        avatar: avatarUrl || null,
      });

      showToast("Cập nhật thông tin thành công!", "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.message || "Có lỗi xảy ra khi cập nhật thông tin";
      setErrors({ submit: errorMsg });
      showToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "role_id" ? parseInt(value) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleClose = () => {
    // Clean up preview URL if it was created from file
    if (avatarFile && avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(null);
    setErrors({});
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-black">Chỉnh sửa người dùng</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Avatar Upload Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-black text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200"
                title="Thay đổi avatar"
              >
                <Camera size={14} />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              {avatarFile
                ? `Đã chọn: ${avatarFile.name}`
                : "Click vào avatar để thay đổi"}
            </p>
            {errors.avatar && (
              <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên người dùng *
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.user_name ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:border-black transition-colors duration-200`}
                  placeholder="Nhập tên người dùng"
                />
              </div>
              {errors.user_name && (
                <p className="text-red-500 text-xs mt-1">{errors.user_name}</p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.user_email ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:border-black transition-colors duration-200`}
                  placeholder="Nhập email"
                />
              </div>
              {errors.user_email && (
                <p className="text-red-500 text-xs mt-1">{errors.user_email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="tel"
                  name="user_phone"
                  value={formData.user_phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.user_phone ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:border-black transition-colors duration-200`}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              {errors.user_phone && (
                <p className="text-red-500 text-xs mt-1">{errors.user_phone}</p>
              )}
            </div>

            {/* Role */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò *
              </label>
              <div className="relative">
                <Shield
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-200"
                >
                  <option value={0}>Admin</option>
                  <option value={1}>Nhân viên</option>
                  <option value={2}>Khách hàng</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <textarea
                  name="user_address"
                  value={formData.user_address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-200 resize-none"
                  placeholder="Nhập địa chỉ (không bắt buộc)"
                />
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 p-3 mt-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserForm;
