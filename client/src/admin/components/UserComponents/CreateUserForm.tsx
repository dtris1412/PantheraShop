import { useState, useRef } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  UserCheck,
  MapPin,
  Shield,
  Camera,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAdmin } from "../../contexts/adminContext";
import { showToast } from "../../../shared/components/Toast";

interface CreateUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  user_name: string;
  user_email: string;
  user_password: string;
  confirm_password: string;
  user_phone: string;
  user_address: string;
  role_id: number;
  avatar?: string;
}

const CreateUserForm = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    user_name: "",
    user_email: "",
    user_password: "",
    confirm_password: "",
    user_phone: "",
    user_address: "",
    role_id: 2,
    avatar: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createUser, uploadAvatar } = useAdmin();

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // 5MB
      const errorMsg = "File ảnh không được vượt quá 5MB";
      setErrors({ ...errors, avatar: errorMsg });
      showToast(errorMsg, "error");
      return;
    }

    setUploadingAvatar(true);
    showToast("Đang upload avatar...", "info");

    try {
      const avatarUrl = await uploadAvatar(file);
      setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
      setAvatarPreview(avatarUrl);

      // Clear avatar error if exists
      if (errors.avatar) {
        setErrors((prev) => ({ ...prev, avatar: "" }));
      }

      showToast("Upload avatar thành công!", "success");
    } catch (error: any) {
      const errorMsg = error.message || "Upload avatar thất bại";
      setErrors({
        ...errors,
        avatar: errorMsg,
      });
      showToast(errorMsg, "error");
    } finally {
      setUploadingAvatar(false);
    }
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

    if (!formData.user_password) {
      newErrors.user_password = "Mật khẩu là bắt buộc";
    } else if (
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/.test(formData.user_password)
    ) {
      newErrors.user_password =
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Xác nhận mật khẩu là bắt buộc";
    } else if (formData.user_password !== formData.confirm_password) {
      newErrors.confirm_password = "Mật khẩu xác nhận không khớp";
    }

    if (formData.user_phone && !/^\d{9,11}$/.test(formData.user_phone)) {
      newErrors.user_phone = "Số điện thoại phải có 9-11 chữ số";
    }

    setErrors(newErrors);

    // Show validation errors via toast
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      showToast(firstError, "error");
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    showToast("Đang tạo tài khoản...", "info");

    try {
      await createUser({
        user_name: formData.user_name,
        user_email: formData.user_email,
        user_password: formData.user_password,
        user_phone: formData.user_phone || undefined,
        user_address: formData.user_address || undefined,
        role_id: formData.role_id,
        avatar: formData.avatar || undefined,
      });

      // Reset form
      setFormData({
        user_name: "",
        user_email: "",
        user_password: "",
        confirm_password: "",
        user_phone: "",
        user_address: "",
        role_id: 2,
        avatar: "",
      });
      setAvatarPreview("");
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);

      // Show success message
      showToast(
        `Tạo tài khoản thành công cho ${formData.user_name}!`,
        "success"
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.message || "Có lỗi xảy ra khi tạo tài khoản";
      setErrors({
        submit: errorMsg,
      });
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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle form close with confirmation if there's unsaved data
  const handleClose = () => {
    const hasData =
      formData.user_name ||
      formData.user_email ||
      formData.user_password ||
      formData.user_phone ||
      formData.user_address ||
      avatarPreview;

    if (hasData) {
      if (
        confirm("Bạn có chắc chắn muốn đóng form? Dữ liệu chưa lưu sẽ bị mất.")
      ) {
        // Reset form data
        setFormData({
          user_name: "",
          user_email: "",
          user_password: "",
          confirm_password: "",
          user_phone: "",
          user_address: "",
          role_id: 2,
          avatar: "",
        });
        setAvatarPreview("");
        setErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-black">Tạo người dùng mới</h2>
          <button
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
                disabled={uploadingAvatar}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-black text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200"
                title="Chọn avatar"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Camera size={14} />
                )}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">Avatar (không bắt buộc)</p>
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

            {/* Password */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu *
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="user_password"
                  value={formData.user_password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2.5 border ${
                    errors.user_password ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:border-black transition-colors duration-200`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.user_password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.user_password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu *
              </label>
              <div className="relative">
                <Shield
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2.5 border ${
                    errors.confirm_password
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:border-black transition-colors duration-200`}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirm_password}
                </p>
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
                <UserCheck
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

            {/* Address - Full width */}
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

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 p-3 mt-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingAvatar}
              className="flex-1 px-4 py-2.5 bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {submitting ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserForm;
