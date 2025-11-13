import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MoreHorizontal,
  ChevronRight,
  Upload,
  X,
  Shield,
} from "lucide-react";
import { showToast } from "../../../shared/components/Toast";
import ConfirmDialog from "../ConfirmDialog";
import { useCategory } from "../../contexts/categoryContext";

interface Team {
  team_id: number;
  team_name: string;
  team_logo?: string;
  team_description?: string;
  tournament_id: number;
  tournament_name?: string;
  sport_name?: string;
  product_count?: number;
  created_at?: string;
}

interface Tournament {
  tournament_id: number;
  tournament_name: string;
  sport_id: number;
  sport_name: string;
}

interface TeamFormData {
  team_name: string;
  team_description: string;
  tournament_id: string;
  team_logo: string;
}

const TeamManagement = () => {
  const {
    getTeamsPaginated,
    getAllSports,
    getAllTournaments,
    createTeam,
    updateTeam,
    deleteTeam,
    loading,
  } = useCategory();

  const [paginatedTeams, setPaginatedTeams] = useState<Team[]>([]);
  const [totalTeams, setTotalTeams] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sports, setSports] = useState<
    { sport_id: number; sport_name: string }[]
  >([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [loadingPaginated, setLoadingPaginated] = useState(false);
  const itemsPerPage = 9;

  const [formData, setFormData] = useState<TeamFormData>({
    team_name: "",
    team_description: "",
    tournament_id: "",
    team_logo: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchSports();
    fetchTournaments();
  }, []);

  useEffect(() => {
    fetchPaginatedTeams();
  }, [debouncedSearchTerm, selectedSport, selectedTournament, currentPage]);

  const fetchSports = async () => {
    try {
      const data = await getAllSports();
      setSports(
        data.map((sport: any) => ({
          sport_id: sport.sport_id,
          sport_name: sport.sport_name,
        }))
      );
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
        tournament_id: tournament.tournament_id,
        tournament_name: tournament.tournament_name,
        sport_id: tournament.Sport?.sport_id,
        sport_name: tournament.Sport?.sport_name,
      }));
      setTournaments(transformedTournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      showToast("Không thể tải giải đấu", "error");
    }
  };

  const fetchPaginatedTeams = async () => {
    try {
      setLoadingPaginated(true);
      const result = await getTeamsPaginated(
        debouncedSearchTerm,
        selectedSport,
        selectedTournament,
        itemsPerPage,
        currentPage
      );
      // Transform backend data to frontend format
      const transformedTeams = result.teams.map((team: any) => ({
        ...team,
        tournament_name: team.Tournament?.tournament_name,
        sport_name: team.Tournament?.Sport?.sport_name,
      }));
      setPaginatedTeams(transformedTeams);
      setTotalTeams(result.total);
    } catch (error) {
      console.error("Error fetching teams:", error);
      showToast("Không thể tải đội/CLB", "error");
    } finally {
      setLoadingPaginated(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const teamData = {
        team_name: formData.team_name,
        team_description: formData.team_description,
        tournament_id: parseInt(formData.tournament_id),
        team_logo: formData.team_logo,
      };

      if (editingTeam) {
        await updateTeam(editingTeam.team_id, teamData);
        showToast("Cập nhật đội/CLB thành công", "success");
      } else {
        await createTeam(teamData);
        showToast("Tạo đội/CLB thành công", "success");
      }

      setShowForm(false);
      setEditingTeam(null);
      resetForm();
      fetchPaginatedTeams();
    } catch (error) {
      console.error("Error saving team:", error);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      team_name: team.team_name,
      team_description: team.team_description || "",
      tournament_id: team.tournament_id.toString(),
      team_logo: team.team_logo || "",
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingTeam) return;

    try {
      await deleteTeam(deletingTeam.team_id);
      showToast("Xóa đội/CLB thành công", "success");
      setDeletingTeam(null);
      fetchPaginatedTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      team_name: "",
      team_description: "",
      tournament_id: "",
      team_logo: "",
    });
    setEditingTeam(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const totalPages = Math.ceil(totalTeams / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          team_logo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="text-green-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Đội/CLB</h1>
          </div>
          <p className="text-gray-600 mt-1">Quản lý các đội và câu lạc bộ</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Thêm đội/CLB
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
              placeholder="Tìm kiếm đội/CLB..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            />
          </div>
          <div className="w-48">
            <select
              value={selectedSport}
              onChange={(e) => {
                setSelectedSport(e.target.value);
                setSelectedTournament("");
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            >
              <option value="">Tất cả môn</option>
              {sports.map((sport) => (
                <option key={sport.sport_id} value={sport.sport_id}>
                  {sport.sport_name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-64">
            <select
              value={selectedTournament}
              onChange={(e) => {
                setSelectedTournament(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
            >
              <option value="">Tất cả giải đấu</option>
              {tournaments
                .filter(
                  (t) =>
                    !selectedSport || t.sport_id.toString() === selectedSport
                )
                .map((tournament) => (
                  <option
                    key={tournament.tournament_id}
                    value={tournament.tournament_id}
                  >
                    {tournament.tournament_name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {loadingPaginated ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTeams.map((team) => (
            <div
              key={team.team_id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl overflow-hidden">
                    {team.team_logo ? (
                      <img
                        src={team.team_logo}
                        alt={team.team_name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML =
                            '<svg class="text-green-600" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V14H16V22H8V14H9.2V10C9.2,8.6 10.6,7 12,7Z"/></svg>';
                        }}
                      />
                    ) : (
                      <Shield className="text-green-600" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {team.team_name}
                    </h3>
                    <p className="text-sm text-green-600">
                      {team.tournament_name}
                    </p>
                    <p className="text-xs text-gray-500">{team.sport_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {team.product_count || 0} sản phẩm
                    </p>
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => handleEdit(team)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit size={14} />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => setDeletingTeam(team)}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>

              {team.team_description && (
                <p className="text-sm text-gray-600 mb-4">
                  {team.team_description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>ID: #{team.team_id}</span>
                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                  Xem sản phẩm
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {paginatedTeams.length === 0 && !loadingPaginated && (
        <div className="text-center py-12">
          <Shield className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy đội/CLB
          </h3>
          <p className="text-gray-500">
            {searchTerm || selectedSport || selectedTournament
              ? "Thử thay đổi bộ lọc"
              : "Chưa có đội/CLB nào"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <div className="flex gap-2">
              {renderPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  disabled={page === "..."}
                  className={`px-3 py-1 rounded ${
                    page === currentPage
                      ? "bg-black text-white"
                      : page === "..."
                      ? "cursor-default"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingTeam ? "Chỉnh sửa đội/CLB" : "Thêm đội/CLB mới"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giải đấu *
                </label>
                <select
                  value={formData.tournament_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tournament_id: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  required
                >
                  <option value="">Chọn giải đấu</option>
                  {tournaments.map((tournament) => (
                    <option
                      key={tournament.tournament_id}
                      value={tournament.tournament_id}
                    >
                      {tournament.tournament_name} ({tournament.sport_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đội/CLB *
                </label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      team_name: e.target.value,
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
                  value={formData.team_description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      team_description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo đội
                </label>
                <div className="flex items-center gap-3">
                  {formData.team_logo && (
                    <div className="relative">
                      {formData.team_logo.startsWith("data:") ? (
                        <img
                          src={formData.team_logo}
                          alt="Logo"
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center text-2xl bg-gray-100 rounded">
                          {formData.team_logo}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, team_logo: "" }))
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
                      value={formData.team_logo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          team_logo: e.target.value,
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
                          onChange={handleLogoChange}
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
                    : editingTeam
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
        isOpen={!!deletingTeam}
        title="Xóa đội/CLB"
        message={`Bạn có chắc chắn muốn xóa đội/CLB "${deletingTeam?.team_name}"? Tất cả sản phẩm liên quan sẽ mất thông tin đội. Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onClose={() => setDeletingTeam(null)}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default TeamManagement;
