import { useEffect, useState } from "react";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { showToast } from "../components/Toast";

export default function ProfilePage() {
  const { token, fetchProfile, logout, updateProfile, updatePassword } =
    useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editData, setEditData] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
    user_address: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const getProfile = async () => {
      try {
        const data = await fetchProfile();
        setProfile(data);
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, [token]);

  // Update editData when profile changes
  useEffect(() => {
    if (profile) {
      setEditData({
        user_name: profile.user_name || "",
        user_email: profile.user_email || "",
        user_phone: profile.user_phone || "",
        user_address: profile.user_address || "",
      });
    }
  }, [profile]);

  if (loading) return <Loading />;
  if (!profile) return <p>Không thể tải thông tin người dùng</p>;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(editData);
      showToast("Profile updated successfully!", "success");
      setIsEditing(false);

      // Gọi lại fetchProfile để lấy thông tin mới nhất
      const newProfile = await fetchProfile();
      setProfile(newProfile);
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      showToast("Update failed!", "error");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    try {
      const result = await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      if (result && result.success) {
        showToast("Password changed successfully!", "success");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // Đóng form đổi mật khẩu nếu có
      } else {
        showToast(result?.message || "Change password failed!", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Change password failed!", "error");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-1">{profile.user_name}</h2>
                <p className="text-sm text-gray-600">{profile.user_email}</p>
              </div>
              <div className="space-y-3 text-sm">
                <button
                  onClick={() => navigate("/order-history")}
                  className="w-full text-left px-4 py-3 border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
                >
                  Order History
                </button>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full text-left px-4 py-3 border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
                >
                  Change Password
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="w-full text-left px-4 py-3 border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-red-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-sm font-medium hover:underline"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-sm font-medium text-gray-600 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                    <User className="w-4 h-4" />
                    <span>Full Name</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.user_name}
                      onChange={(e) =>
                        setEditData({ ...editData, user_name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                      required
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 border border-gray-200">
                      {profile.user_name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.user_email}
                      onChange={(e) =>
                        setEditData({ ...editData, user_email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                      required
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 border border-gray-200">
                      {profile.user_email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.user_phone}
                      onChange={(e) =>
                        setEditData({ ...editData, user_phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 border border-gray-200">
                      {profile.user_phone || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Address</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.user_address}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          user_address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                      rows={3}
                    />
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 border border-gray-200">
                      {profile.user_address || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
                {isEditing && (
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </button>
                )}
              </form>
            </div>
            {isChangingPassword && (
              <div className="bg-white border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Change Password</h2>
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    className="text-sm font-medium text-gray-600 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                      <Lock className="w-4 h-4" />
                      <span>Current Password</span>
                    </label>
                    <div className="relative">
                      <input
                        placeholder="CurrentPassword123"
                        type={showCurrent ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        onClick={() => setShowCurrent((v) => !v)}
                        tabIndex={-1}
                      >
                        {showCurrent ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                      <Lock className="w-4 h-4" />
                      <span>New Password</span>
                    </label>
                    <div className="relative">
                      <input
                        placeholder="NewPassword123"
                        type={showNew ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black pr-10"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        onClick={() => setShowNew((v) => !v)}
                        tabIndex={-1}
                      >
                        {showNew ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 6 characters
                    </p>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                      <Lock className="w-4 h-4" />
                      <span>Confirm New Password</span>
                    </label>
                    <div className="relative">
                      <input
                        placeholder="NewPassword123"
                        type={showConfirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black pr-10"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        onClick={() => setShowConfirm((v) => !v)}
                        tabIndex={-1}
                      >
                        {showConfirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
