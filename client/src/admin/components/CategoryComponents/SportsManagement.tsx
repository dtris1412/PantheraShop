import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Trophy,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { showToast } from "../../../shared/components/Toast";
import ConfirmDialog from "../ConfirmDialog";
import { useCategory } from "../../contexts/categoryContext";
import ImageUpload from "../ImageUpload";

interface Sport {
  sport_id: number;
  sport_name: string;
  has_teams: number;
  sport_icon?: string;
  has_tournament: number;
  created_at?: string;
  tournament_count?: number;
  team_count?: number;
}

interface SportFormData {
  sport_name: string;
  has_teams: boolean;
  has_tournament: boolean;
  sport_icon: string;
}

const SportsManagement = () => {
  const { getAllSports, createSport, updateSport, deleteSport, loading } =
    useCategory();

  const [sports, setSports] = useState<Sport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [deletingSport, setDeletingSport] = useState<Sport | null>(null);

  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<SportFormData>({
    sport_name: "",
    has_teams: true,
    has_tournament: true,
    sport_icon: "",
  });

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const data = await getAllSports();
      // Transform backend data to frontend format
      const transformedSports = data.map((sport: any) => ({
        ...sport,
        tournament_count: sport.Tournaments?.length || 0,
        team_count:
          sport.Tournaments?.reduce(
            (acc: number, tournament: any) =>
              acc + (tournament.Teams?.length || 0),
            0
          ) || 0,
      }));
      setSports(transformedSports);
    } catch (error) {
      console.error("Error fetching sports:", error);
      showToast("Không thể tải môn thể thao", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const sportData = {
        sport_name: formData.sport_name,
        has_teams: formData.has_teams,
        has_tournaments: formData.has_tournament,
        sport_icon: imageFile ? undefined : formData.sport_icon, // Chỉ gửi text icon nếu không có file
      };

      if (editingSport) {
        await updateSport(
          editingSport.sport_id,
          sportData,
          imageFile || undefined
        );
        showToast("Cập nhật môn thể thao thành công", "success");
      } else {
        await createSport(sportData, imageFile || undefined);
        showToast("Tạo môn thể thao thành công", "success");
      }

      setShowForm(false);
      setEditingSport(null);
      resetForm();
      fetchSports();
    } catch (error) {
      console.error("Error saving sport:", error);
    }
  };

  const handleEdit = (sport: Sport) => {
    setEditingSport(sport);
    setFormData({
      sport_name: sport.sport_name,
      has_teams: sport.has_teams === 1,
      has_tournament: sport.has_tournament === 1,
      sport_icon: sport.sport_icon || "",
    });
    setImageFile(null);
    setImagePreview(sport.sport_icon || "");
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingSport) return;

    try {
      await deleteSport(deletingSport.sport_id);
      showToast("Xóa môn thể thao thành công", "success");
      setDeletingSport(null);
      fetchSports();
    } catch (error) {
      console.error("Error deleting sport:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      sport_name: "",
      has_teams: true,
      has_tournament: true,
      sport_icon: "",
    });
    setEditingSport(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview("");
    if (editingSport) {
      setFormData((prev) => ({ ...prev, sport_icon: "" }));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          sport_icon: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredSports = sports.filter((sport) =>
    sport.sport_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="text-orange-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Môn thể thao</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Quản lý các môn thể thao và cấu hình
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Thêm môn thể thao
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm môn thể thao..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Sports Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSports.map((sport) => (
            <div
              key={sport.sport_id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl overflow-hidden">
                    {sport.sport_icon ? (
                      <img
                        src={sport.sport_icon}
                        alt={sport.sport_name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML =
                            '<svg class="text-orange-600" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
                        }}
                      />
                    ) : (
                      <Trophy className="text-orange-600" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {sport.sport_name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{sport.tournament_count || 0} giải đấu</span>
                      <span>{sport.team_count || 0} đội</span>
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => handleEdit(sport)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit size={14} />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => setDeletingSport(sport)}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Có đội:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      sport.has_teams
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {sport.has_teams ? "Có" : "Không"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Có giải đấu:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      sport.has_tournament
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {sport.has_tournament ? "Có" : "Không"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ID: #{sport.sport_id}</span>
                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                  Xem chi tiết
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredSports.length === 0 && !loading && (
        <div className="text-center py-12">
          <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy môn thể thao
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Thử tìm kiếm với từ khóa khác"
              : "Chưa có môn thể thao nào"}
          </p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingSport
                  ? "Chỉnh sửa môn thể thao"
                  : "Thêm môn thể thao mới"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên môn thể thao *
                </label>
                <input
                  type="text"
                  value={formData.sport_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sport_name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon môn thể thao
                </label>
                <div className="flex justify-center">
                  <ImageUpload
                    currentImage={imagePreview || formData.sport_icon}
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                    placeholder="Icon thể thao"
                    maxSize={2}
                    className="w-20 h-20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="has_teams"
                    checked={formData.has_teams}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        has_teams: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label
                    htmlFor="has_teams"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Môn thể thao này có đội/CLB
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="has_tournament"
                    checked={formData.has_tournament}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        has_tournament: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label
                    htmlFor="has_tournament"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Môn thể thao này có giải đấu
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading
                    ? "Đang lưu..."
                    : editingSport
                    ? "Cập nhật"
                    : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingSport}
        title="Xóa môn thể thao"
        message={`Bạn có chắc chắn muốn xóa môn thể thao "${deletingSport?.sport_name}"? Tất cả giải đấu và đội liên quan sẽ bị xóa. Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onClose={() => setDeletingSport(null)}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default SportsManagement;
