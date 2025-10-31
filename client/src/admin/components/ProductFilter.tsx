import { X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

interface Sport {
  sport_id: number;
  sport_name: string;
}

interface Tournament {
  tournament_id: number;
  tournament_name: string;
  sport_id: number;
}

interface Team {
  team_id: number;
  team_name: string;
  tournament_id: number;
}

interface Category {
  category_id: number;
  category_name: string;
}

interface FilterState {
  sport_id: number | null;
  tournament_id: number | null;
  team_id: number | null;
  category_id: number | null;
  status: "all" | "in_stock" | "low_stock" | "out_of_stock";
  sortBy: "name_asc" | "name_desc" | "price_asc" | "price_desc" | "newest";
}

interface ProductFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  products: any[]; // Danh sách products để extract filter options
}

const ProductFilter = ({
  filters,
  onFilterChange,
  onReset,
  products,
}: ProductFilterProps) => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Extract filter options từ danh sách products
  useEffect(() => {
    if (!products || products.length === 0) return;

    // Extract unique sports và categories
    const sportsMap = new Map<number, Sport>();
    const categoriesMap = new Map<number, Category>();

    products.forEach((product) => {
      // Extract category
      if (product.Category) {
        categoriesMap.set(product.Category.category_id, {
          category_id: product.Category.category_id,
          category_name: product.Category.category_name,
        });
      }

      // Extract sport through Team → Tournament → Sport
      if (product.Team?.Tournament?.Sport) {
        const sport = product.Team.Tournament.Sport;
        sportsMap.set(sport.sport_id, {
          sport_id: sport.sport_id,
          sport_name: sport.sport_name,
        });
      }
    });

    // Convert maps to arrays và sort
    setSports(
      Array.from(sportsMap.values()).sort((a, b) =>
        a.sport_name.localeCompare(b.sport_name, "vi")
      )
    );
    setCategories(
      Array.from(categoriesMap.values()).sort((a, b) =>
        a.category_name.localeCompare(b.category_name, "vi")
      )
    );
  }, [products]);

  // Update tournaments khi sport thay đổi
  useEffect(() => {
    if (!filters.sport_id || !products) {
      setTournaments([]);
      setTeams([]);
      return;
    }

    const tournamentsMap = new Map<number, Tournament>();

    products.forEach((product) => {
      if (product.Team?.Tournament?.Sport?.sport_id === filters.sport_id) {
        const tournament = product.Team.Tournament;
        tournamentsMap.set(tournament.tournament_id, {
          tournament_id: tournament.tournament_id,
          tournament_name: tournament.tournament_name,
          sport_id: tournament.Sport.sport_id,
        });
      }
    });

    setTournaments(
      Array.from(tournamentsMap.values()).sort((a, b) =>
        a.tournament_name.localeCompare(b.tournament_name, "vi")
      )
    );
  }, [filters.sport_id, products]);

  // Update teams khi tournament thay đổi
  useEffect(() => {
    if (!filters.tournament_id || !products) {
      setTeams([]);
      return;
    }

    const teamsMap = new Map<number, Team>();

    products.forEach((product) => {
      if (product.Team?.tournament_id === filters.tournament_id) {
        teamsMap.set(product.Team.team_id, {
          team_id: product.Team.team_id,
          team_name: product.Team.team_name,
          tournament_id: product.Team.tournament_id,
        });
      }
    });

    setTeams(
      Array.from(teamsMap.values()).sort((a, b) =>
        a.team_name.localeCompare(b.team_name, "vi")
      )
    );
  }, [filters.tournament_id, products]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };

    // Reset dependent filters
    if (key === "sport_id") {
      newFilters.tournament_id = null;
      newFilters.team_id = null;
    } else if (key === "tournament_id") {
      newFilters.team_id = null;
    }

    onFilterChange(newFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.sport_id !== null ||
      filters.tournament_id !== null ||
      filters.team_id !== null ||
      filters.category_id !== null ||
      filters.status !== "all" ||
      filters.sortBy !== "newest"
    );
  };

  return (
    <div className="bg-white border border-gray-200">
      {/* Filter Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
        >
          <SlidersHorizontal size={18} />
          <span>Bộ lọc & Sắp xếp</span>
          {hasActiveFilters() && (
            <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full">
              {
                Object.values(filters).filter(
                  (v) => v !== null && v !== "all" && v !== "newest"
                ).length
              }
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        {hasActiveFilters() && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <X size={16} />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Sport Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Môn thể thao
            </label>
            <select
              value={filters.sport_id || ""}
              onChange={(e) =>
                handleFilterChange(
                  "sport_id",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
            >
              <option value="">Tất cả</option>
              {sports.map((sport) => (
                <option key={sport.sport_id} value={sport.sport_id}>
                  {sport.sport_name}
                </option>
              ))}
            </select>
          </div>
          {/* Tournament Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Giải đấu
            </label>
            <select
              value={filters.tournament_id || ""}
              onChange={(e) =>
                handleFilterChange(
                  "tournament_id",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
              disabled={!filters.sport_id || tournaments.length === 0}
            >
              <option value="">Tất cả</option>
              {tournaments.map((tournament) => (
                <option
                  key={tournament.tournament_id}
                  value={tournament.tournament_id}
                >
                  {tournament.tournament_name}
                </option>
              ))}
            </select>
          </div>
          {/* Team Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Đội/CLB
            </label>
            <select
              value={filters.team_id || ""}
              onChange={(e) =>
                handleFilterChange(
                  "team_id",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
              disabled={!filters.tournament_id || teams.length === 0}
            >
              <option value="">Tất cả</option>
              {teams.map((team) => (
                <option key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Phân loại
            </label>
            <select
              value={filters.category_id || ""}
              onChange={(e) =>
                handleFilterChange(
                  "category_id",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
            >
              <option value="">Tất cả</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>
          s{/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
            >
              <option value="all">Tất cả</option>
              <option value="in_stock">Còn hàng</option>
              <option value="low_stock">Sắp hết</option>
              <option value="out_of_stock">Hết hàng</option>
            </select>
          </div>
          {/* Sort By */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Sắp xếp
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-black transition-colors"
            >
              <option value="newest">Mới nhất</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;
