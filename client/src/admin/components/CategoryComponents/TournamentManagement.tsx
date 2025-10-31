import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Award,
  MoreHorizontal,
  ChevronRight,
  X,
  Upload,
} from "lucide-react";
import { showToast } from "../../../shared/components/Toast";
import ConfirmDialog from "../ConfirmDialog";
import { useCategory } from "../../contexts/categoryContext";
import ImageUpload from "../ImageUpload";

interface Tournament {
  tournament_id: number;
  tournament_name: string;
  tournament_icon?: string;
  tournament_description?: string;
  sport_id: number;
  sport_name?: string;
  team_count?: number;
  created_at?: string;
}

interface Sport {
  sport_id: number;
  sport_name: string;
  sport_icon?: string;
}

interface TournamentFormData {
  tournament_name: string;
  tournament_description: string;
  sport_id: string;
  tournament_icon: string;
}

const TournamentManagement = () => {
  const {
    getAllTournaments,
    getAllSports,
    createTournament,
    updateTournament,
    deleteTournament,
    loading,
  } = useCategory();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(
    null
  );
  const [deletingTournament, setDeletingTournament] =
    useState<Tournament | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>("");

  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<TournamentFormData>({
    tournament_name: "",
    tournament_description: "",
    sport_id: "",
    tournament_icon: "",
  });

  // Image handlers
  const handleImageSelect = (file: File) => {
    setImageFile(file);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview("");
  };

  useEffect(() => {
    fetchTournaments();
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const data = await getAllSports();
      setSports(data);
    } catch (error) {
      console.error("Error fetching sports:", error);
      showToast("Không thể tải môn thể thao", "error");
    }
  };

  const fetchTournaments = async () => {
    try {
      const data = await getAllTournaments();
      // Transform backend data to frontend format
      const transformedTournaments = data.map((tournament: any) => ({
        ...tournament,
        sport_name: tournament.Sport?.sport_name,
        team_count: tournament.Teams?.length || 0,
      }));
      setTournaments(transformedTournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      showToast("Không thể tải giải đấu", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tournamentData = {
        tournament_name: formData.tournament_name,
        tournament_description: formData.tournament_description,
        sport_id: parseInt(formData.sport_id),
        tournament_icon: formData.tournament_icon,
        ...(imageFile && { imageFile }),
      };

      if (editingTournament) {
        await updateTournament(editingTournament.tournament_id, tournamentData);
        showToast("Cập nhật giải đấu thành công", "success");
      } else {
        await createTournament(tournamentData);
        showToast("Tạo giải đấu thành công", "success");
      }

      setShowForm(false);
      setEditingTournament(null);
      resetForm();
      fetchTournaments();
    } catch (error) {
      console.error("Error saving tournament:", error);
      showToast("Có lỗi xảy ra", "error");
    }
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      tournament_name: tournament.tournament_name,
      tournament_description: tournament.tournament_description || "",
      sport_id: tournament.sport_id.toString(),
      tournament_icon: tournament.tournament_icon || "",
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingTournament) return;

    try {
      await deleteTournament(deletingTournament.tournament_id);
      showToast("Xóa giải đấu thành công", "success");
      setDeletingTournament(null);
      fetchTournaments();
    } catch (error) {
      console.error("Error deleting tournament:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      tournament_name: "",
      tournament_description: "",
      sport_id: "",
      tournament_icon: "",
    });
    setEditingTournament(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          tournament_icon: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchSearch =
      tournament.tournament_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      tournament.tournament_description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchSport =
      !selectedSport || tournament.sport_id.toString() === selectedSport;
    return matchSearch && matchSport;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Award className="text-purple-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Giải đấu</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Quản lý các giải đấu theo môn thể thao
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Thêm giải đấu
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm giải đấu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            />
          </div>
          <div className="w-48">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            >
              <option value="">Tất cả môn thể thao</option>
              {sports.map((sport) => (
                <option key={sport.sport_id} value={sport.sport_id}>
                  {sport.sport_icon} {sport.sport_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <div
              key={tournament.tournament_id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl overflow-hidden">
                    {tournament.tournament_icon ? (
                      <img
                        src={tournament.tournament_icon}
                        alt={tournament.tournament_name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML =
                            '<svg class="text-purple-600" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
                        }}
                      />
                    ) : (
                      <Award className="text-purple-600" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {tournament.tournament_name}
                    </h3>
                    <p className="text-sm text-purple-600">
                      {tournament.sport_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tournament.team_count || 0} đội tham gia
                    </p>
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => handleEdit(tournament)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit size={14} />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => setDeletingTournament(tournament)}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>

              {tournament.tournament_description && (
                <p className="text-sm text-gray-600 mb-4">
                  {tournament.tournament_description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ID: #{tournament.tournament_id}</span>
                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                  Xem đội
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredTournaments.length === 0 && !loading && (
        <div className="text-center py-12">
          <Award className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy giải đấu
          </h3>
          <p className="text-gray-500">
            {searchTerm || selectedSport
              ? "Thử thay đổi bộ lọc"
              : "Chưa có giải đấu nào"}
          </p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingTournament ? "Chỉnh sửa giải đấu" : "Thêm giải đấu mới"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Môn thể thao *
                </label>
                <select
                  value={formData.sport_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sport_id: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  required
                >
                  <option value="">Chọn môn thể thao</option>
                  {sports.map((sport) => (
                    <option key={sport.sport_id} value={sport.sport_id}>
                      {sport.sport_icon} {sport.sport_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên giải đấu *
                </label>
                <input
                  type="text"
                  value={formData.tournament_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tournament_name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.tournament_description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tournament_description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon giải đấu
                </label>
                <div className="flex items-center gap-3">
                  {formData.tournament_icon && (
                    <div className="relative">
                      {formData.tournament_icon.startsWith("data:") ? (
                        <img
                          src={formData.tournament_icon}
                          alt="Icon"
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center text-2xl bg-gray-100 rounded">
                          {formData.tournament_icon}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            tournament_icon: "",
                          }))
                        }
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.tournament_icon}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tournament_icon: e.target.value,
                        }))
                      }
                      placeholder="Nhập emoji hoặc text..."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    />
                    <div className="mt-2">
                      <label className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <Upload size={14} />
                        Hoặc tải lên hình ảnh
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
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
                    : editingTournament
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
        isOpen={!!deletingTournament}
        title="Xóa giải đấu"
        message={`Bạn có chắc chắn muốn xóa giải đấu "${deletingTournament?.tournament_name}"? Tất cả đội liên quan sẽ bị xóa. Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onClose={() => setDeletingTournament(null)}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default TournamentManagement;
