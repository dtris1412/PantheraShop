import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Award,
  MoreHorizontal,
  ChevronRight,
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
    getTournamentsPaginated,
    getAllSports,
    createTournament,
    updateTournament,
    deleteTournament,
    loading,
  } = useCategory();

  const [paginatedTournaments, setPaginatedTournaments] = useState<
    Tournament[]
  >([]);
  const [totalTournaments, setTotalTournaments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sports, setSports] = useState<Sport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loadingPaginated, setLoadingPaginated] = useState(false);
  const itemsPerPage = 9;

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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load sports for filter
  useEffect(() => {
    fetchSports();
  }, []);

  // Fetch paginated tournaments
  useEffect(() => {
    fetchPaginatedTournaments();
  }, [debouncedSearchTerm, selectedSport, currentPage]);

  const fetchSports = async () => {
    try {
      const data = await getAllSports();
      setSports(data);
    } catch (error) {
      console.error("Error fetching sports:", error);
      showToast("Không thể tải môn thể thao", "error");
    }
  };

  const fetchPaginatedTournaments = async () => {
    try {
      setLoadingPaginated(true);
      const selectedSportName =
        sports.find((s) => s.sport_id.toString() === selectedSport)
          ?.sport_name || "";
      const data = await getTournamentsPaginated(
        debouncedSearchTerm,
        selectedSportName,
        itemsPerPage,
        currentPage
      );
      setPaginatedTournaments(data.tournaments);
      setTotalTournaments(data.total);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      showToast("Không thể tải giải đấu", "error");
    } finally {
      setLoadingPaginated(false);
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
      fetchPaginatedTournaments();
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
    setImagePreview(tournament.tournament_icon || "");
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingTournament) return;

    try {
      await deleteTournament(deletingTournament.tournament_id);
      showToast("Xóa giải đấu thành công", "success");
      setDeletingTournament(null);
      fetchPaginatedTournaments();
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
    setImageFile(null);
    setImagePreview("");
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const totalPages = Math.ceil(totalTournaments / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded ${
              currentPage === i
                ? "bg-black text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          1
        </button>
      );

      pages.push(
        <button
          key={2}
          onClick={() => handlePageChange(2)}
          className={`px-3 py-1 rounded ${
            currentPage === 2
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          2
        </button>
      );

      if (currentPage > 4) {
        pages.push(
          <span key="dots1" className="px-2">
            ...
          </span>
        );
      }

      const start = Math.max(3, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i > 2 && i < totalPages - 1) {
          pages.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`px-3 py-1 rounded ${
                currentPage === i
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i}
            </button>
          );
        }
      }

      if (currentPage < totalPages - 3) {
        pages.push(
          <span key="dots2" className="px-2">
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={totalPages - 1}
          onClick={() => handlePageChange(totalPages - 1)}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages - 1
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {totalPages - 1}
        </button>
      );

      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

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
          {paginatedTournaments.map((tournament) => (
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

      {paginatedTournaments.length === 0 && !loadingPaginated && (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
              {Math.min(currentPage * itemsPerPage, totalTournaments)} trong
              tổng {totalTournaments} giải đấu
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {renderPageNumbers()}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
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
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                  currentImage={
                    imagePreview || editingTournament?.tournament_icon
                  }
                  maxSizeMB={3}
                />
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
