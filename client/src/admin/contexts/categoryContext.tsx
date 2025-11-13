import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { showToast } from "../../shared/components/Toast";

const apiUrl = import.meta.env.VITE_API_URL;
// const API_BASE_URL = "http://localhost:8080/api/admin";

// Type definitions
interface Category {
  category_id: number;
  category_name: string;
  category_description?: string;
  created_at: string;
  product_count?: number;
}

interface Sport {
  sport_id: number;
  sport_name: string;
  sport_description?: string;
  sport_icon?: string;
  has_teams: boolean;
  has_tournaments: boolean;
  created_at?: string;
  Tournaments?: Tournament[];
}

interface Tournament {
  tournament_id: number;
  tournament_name: string;
  tournament_description?: string;
  tournament_icon?: string;
  sport_id: number;
  created_at?: string;
  Sport?: Sport;
  Teams?: Team[];
}

interface Team {
  team_id: number;
  team_name: string;
  team_description?: string;
  team_logo?: string;
  tournament_id: number;
  created_at?: string;
  Tournament?: Tournament;
  product_count?: number;
}

interface CategoryStats {
  categoriesCount: number;
  sportsCount: number;
  tournamentsCount: number;
  teamsCount: number;
}

interface CategoryContextType {
  loading: boolean;

  // Statistics
  getStats: () => Promise<CategoryStats>;

  // Categories
  getAllCategories: (forceRefresh?: boolean) => Promise<Category[]>;
  getCategoryById: (id: number) => Promise<Category | null>;
  getCategoriesPaginated: (
    search: string,
    limit: number,
    page: number
  ) => Promise<{
    categories: Category[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  createCategory: (categoryData: Partial<Category>) => Promise<Category>;
  updateCategory: (
    id: number,
    categoryData: Partial<Category>
  ) => Promise<Category>;
  deleteCategory: (id: number) => Promise<boolean>;

  // Sports
  getAllSports: (forceRefresh?: boolean) => Promise<Sport[]>;
  getSportsPaginated: (
    search: string,
    limit: number,
    page: number
  ) => Promise<{
    sports: Sport[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  createSport: (sportData: Partial<Sport>, imageFile?: File) => Promise<Sport>;
  updateSport: (
    id: number,
    sportData: Partial<Sport>,
    imageFile?: File
  ) => Promise<Sport>;
  deleteSport: (id: number) => Promise<boolean>;

  // Tournaments
  getAllTournaments: () => Promise<Tournament[]>;
  getTournamentsBySport: (sportId: number) => Promise<Tournament[]>;
  getTournamentsPaginated: (
    search: string,
    sport: string,
    limit: number,
    page: number
  ) => Promise<{
    tournaments: Tournament[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  createTournament: (
    tournamentData: Partial<Tournament>
  ) => Promise<Tournament>;
  updateTournament: (
    id: number,
    tournamentData: Partial<Tournament>
  ) => Promise<Tournament>;
  deleteTournament: (id: number) => Promise<boolean>;

  // Teams
  getAllTeams: () => Promise<Team[]>;
  getTeamsByTournament: (tournamentId: number) => Promise<Team[]>;
  getTeamsPaginated: (
    search: string,
    sport: string,
    tournament: string,
    limit: number,
    page: number
  ) => Promise<{
    teams: Team[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  createTeam: (teamData: Partial<Team>) => Promise<Team>;
  updateTeam: (id: number, teamData: Partial<Team>) => Promise<Team>;
  deleteTeam: (id: number) => Promise<boolean>;
}

// Utility functions
const getAuthToken = (): string => {
  return localStorage.getItem("token") || "";
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleError = (error: unknown, defaultMessage: string): void => {
  const message = error instanceof Error ? error.message : defaultMessage;
  showToast(message, "error");
};

// Default context value
const defaultContextValue: CategoryContextType = {
  loading: false,
  getStats: async () => ({
    categoriesCount: 0,
    sportsCount: 0,
    tournamentsCount: 0,
    teamsCount: 0,
  }),
  getAllCategories: async () => [],
  getCategoryById: async () => null,
  getCategoriesPaginated: async () => ({
    categories: [],
    total: 0,
    page: 1,
    totalPages: 0,
  }),
  createCategory: async () => ({} as Category),
  updateCategory: async () => ({} as Category),
  deleteCategory: async () => false,
  getAllSports: async () => [],
  getSportsPaginated: async () => ({
    sports: [],
    total: 0,
    page: 1,
    totalPages: 0,
  }),
  createSport: async () => ({} as Sport),
  updateSport: async () => ({} as Sport),
  deleteSport: async () => false,
  getAllTournaments: async () => [],
  getTournamentsBySport: async () => [],
  getTournamentsPaginated: async () => ({
    tournaments: [],
    total: 0,
    page: 1,
    totalPages: 0,
  }),
  createTournament: async () => ({} as Tournament),
  updateTournament: async () => ({} as Tournament),
  deleteTournament: async () => false,
  getAllTeams: async () => [],
  getTeamsByTournament: async () => [],
  getTeamsPaginated: async () => ({
    teams: [],
    total: 0,
    page: 1,
    totalPages: 0,
  }),
  createTeam: async () => ({} as Team),
  updateTeam: async () => ({} as Team),
  deleteTeam: async () => false,
};

// Create context
const CategoryContext = createContext<CategoryContextType>(defaultContextValue);

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider = ({ children }: CategoryProviderProps) => {
  const [loading, setLoading] = useState(false);

  // Cache để tránh gọi API quá nhiều
  const [cache, setCache] = useState({
    categories: null as Category[] | null,
    sports: null as Sport[] | null,
    tournaments: null as Tournament[] | null,
    teams: null as Team[] | null,
    lastFetch: {
      categories: 0,
      sports: 0,
      tournaments: 0,
      teams: 0,
    },
  });

  const CACHE_TIME = 30000; // 30 seconds

  // =============== STATISTICS ===============

  const getStats = useCallback(async (): Promise<CategoryStats> => {
    try {
      // Gọi các API song song để lấy số lượng - KHÔNG set loading để tránh conflict
      const [categoriesRes, sportsRes, tournamentsRes, teamsRes] =
        await Promise.all([
          fetch(`${apiUrl}/admin/categories`, {
            method: "GET",
            headers: getAuthHeaders(),
          }),
          fetch(`${apiUrl}/admin/sports`, {
            method: "GET",
            headers: getAuthHeaders(),
          }),
          fetch(`${apiUrl}/admin/tournaments`, {
            method: "GET",
            headers: getAuthHeaders(),
          }),
          fetch(`${apiUrl}/admin/teams`, {
            method: "GET",
            headers: getAuthHeaders(),
          }),
        ]);

      const [categoriesData, sportsData, tournamentsData, teamsData] =
        await Promise.all([
          categoriesRes.json(),
          sportsRes.json(),
          tournamentsRes.json(),
          teamsRes.json(),
        ]);

      return {
        categoriesCount: categoriesData.categories?.length || 0,
        sportsCount: sportsData.sports?.length || 0,
        tournamentsCount: tournamentsData.tournaments?.length || 0,
        teamsCount: teamsData.teams?.length || 0,
      };
    } catch (error) {
      handleError(error, "Lỗi khi tải thống kê");
      return {
        categoriesCount: 0,
        sportsCount: 0,
        tournamentsCount: 0,
        teamsCount: 0,
      };
    }
  }, []); // Empty dependency array vì function này chỉ cần tạo một lần

  // =============== CATEGORIES ===============

  const getAllCategories = async (
    forceRefresh = false
  ): Promise<Category[]> => {
    // Kiểm tra cache trước
    const now = Date.now();
    if (
      !forceRefresh &&
      cache.categories &&
      now - cache.lastFetch.categories < CACHE_TIME
    ) {
      return cache.categories;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/categories`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch categories");
      }

      const categories = data.categories || [];

      // Cập nhật cache
      setCache((prev) => ({
        ...prev,
        categories,
        lastFetch: { ...prev.lastFetch, categories: now },
      }));

      return categories;
    } catch (error) {
      handleError(error, "Lỗi khi tải danh mục");
      return cache.categories || [];
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = async (id: number): Promise<Category | null> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/categories/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch category");
      }

      return data.category;
    } catch (error) {
      handleError(error, "Lỗi khi tải danh mục");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCategoriesPaginated = async (
    search: string = "",
    limit: number = 9,
    page: number = 1
  ): Promise<{
    categories: Category[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: search.trim(),
        limit: limit.toString(),
        page: page.toString(),
      });

      const response = await fetch(
        `${apiUrl}/admin/categories/paginated?${params}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch categories");
      }

      return {
        categories: data.categories || [],
        total: data.total || 0,
        page: data.page || page,
        totalPages: data.totalPages || 0,
      };
    } catch (error) {
      handleError(error, "Lỗi khi tải danh mục");
      return { categories: [], total: 0, page: 1, totalPages: 0 };
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (
    categoryData: Partial<Category>
  ): Promise<Category> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/categories`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create category");
      }

      // Clear cache khi tạo mới
      setCache((prev) => ({
        ...prev,
        categories: null,
        lastFetch: { ...prev.lastFetch, categories: 0 },
      }));

      return data.category;
    } catch (error) {
      handleError(error, "Lỗi khi tạo danh mục");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (
    id: number,
    categoryData: Partial<Category>
  ): Promise<Category> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/categories/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update category");
      }

      return data.category;
    } catch (error) {
      handleError(error, "Lỗi khi cập nhật danh mục");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete category");
      }

      return true;
    } catch (error) {
      handleError(error, "Lỗi khi xóa danh mục");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // =============== SPORTS ===============

  const getAllSports = async (forceRefresh = false): Promise<Sport[]> => {
    // Kiểm tra cache trước
    const now = Date.now();
    if (
      !forceRefresh &&
      cache.sports &&
      now - cache.lastFetch.sports < CACHE_TIME
    ) {
      return cache.sports;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/sports`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch sports");
      }

      const sports = data.sports || [];

      // Cập nhật cache
      setCache((prev) => ({
        ...prev,
        sports,
        lastFetch: { ...prev.lastFetch, sports: now },
      }));

      return sports;
    } catch (error) {
      handleError(error, "Lỗi khi tải môn thể thao");
      return cache.sports || [];
    } finally {
      setLoading(false);
    }
  };

  const getSportsPaginated = async (
    search: string = "",
    limit: number = 10,
    page: number = 1
  ): Promise<{
    sports: Sport[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("limit", limit.toString());
      params.append("page", page.toString());

      const response = await fetch(
        `${apiUrl}/admin/sports/paginated?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch paginated sports");
      }

      return {
        sports: data.sports || [],
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 0,
      };
    } catch (error) {
      handleError(error, "Lỗi khi tải môn thể thao");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createSport = async (
    sportData: Partial<Sport>,
    imageFile?: File
  ): Promise<Sport> => {
    setLoading(true);
    try {
      let body;
      let headers;

      if (imageFile) {
        // Sử dụng FormData khi có file
        const formData = new FormData();
        if (sportData.sport_name)
          formData.append("sport_name", sportData.sport_name);
        if (sportData.sport_description)
          formData.append("sport_description", sportData.sport_description);
        if (sportData.has_teams !== undefined)
          formData.append("has_teams", sportData.has_teams.toString());
        if (sportData.has_tournaments !== undefined)
          formData.append(
            "has_tournaments",
            sportData.has_tournaments.toString()
          );
        formData.append("sport_icon", imageFile);

        const token = getAuthToken();
        headers = {
          ...(token && { Authorization: `Bearer ${token}` }),
        };
        body = formData;
      } else {
        // Sử dụng JSON khi không có file
        headers = getAuthHeaders();
        body = JSON.stringify(sportData);
      }

      const response = await fetch(`${apiUrl}/admin/sports`, {
        method: "POST",
        headers,
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create sport");
      }

      // Clear cache khi tạo mới
      setCache((prev) => ({
        ...prev,
        sports: null,
        lastFetch: { ...prev.lastFetch, sports: 0 },
      }));

      return data.sport;
    } catch (error) {
      handleError(error, "Lỗi khi tạo môn thể thao");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSport = async (
    id: number,
    sportData: Partial<Sport>,
    imageFile?: File
  ): Promise<Sport> => {
    setLoading(true);
    try {
      let body;
      let headers;

      if (imageFile) {
        // Sử dụng FormData khi có file
        const formData = new FormData();
        if (sportData.sport_name)
          formData.append("sport_name", sportData.sport_name);
        if (sportData.sport_description)
          formData.append("sport_description", sportData.sport_description);
        if (sportData.has_teams !== undefined)
          formData.append("has_teams", sportData.has_teams.toString());
        if (sportData.has_tournaments !== undefined)
          formData.append(
            "has_tournaments",
            sportData.has_tournaments.toString()
          );
        formData.append("sport_icon", imageFile);

        const token = getAuthToken();
        headers = {
          ...(token && { Authorization: `Bearer ${token}` }),
        };
        body = formData;
      } else {
        // Sử dụng JSON khi không có file
        headers = getAuthHeaders();
        body = JSON.stringify(sportData);
      }

      const response = await fetch(`${apiUrl}/admin/sports/${id}`, {
        method: "PUT",
        headers,
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update sport");
      }

      // Clear cache khi cập nhật
      setCache((prev) => ({
        ...prev,
        sports: null,
        lastFetch: { ...prev.lastFetch, sports: 0 },
      }));

      return data.sport;
    } catch (error) {
      handleError(error, "Lỗi khi cập nhật môn thể thao");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSport = async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/sports/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete sport");
      }

      return true;
    } catch (error) {
      handleError(error, "Lỗi khi xóa môn thể thao");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // =============== TOURNAMENTS ===============

  const getAllTournaments = async (): Promise<Tournament[]> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/tournaments`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tournaments");
      }

      return data.tournaments || [];
    } catch (error) {
      handleError(error, "Lỗi khi tải giải đấu");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTournamentsBySport = async (
    sportId: number
  ): Promise<Tournament[]> => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/admin/sports/${sportId}/tournaments`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tournaments");
      }

      return data.tournaments || [];
    } catch (error) {
      handleError(error, "Lỗi khi tải giải đấu");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTournamentsPaginated = async (
    search: string = "",
    sport: string = "",
    limit: number = 10,
    page: number = 1
  ): Promise<{
    tournaments: Tournament[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (sport) params.append("sport", sport);
      params.append("limit", limit.toString());
      params.append("page", page.toString());

      const response = await fetch(
        `${apiUrl}/admin/tournaments/paginated?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch paginated tournaments"
        );
      }

      return {
        tournaments: data.tournaments || [],
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 0,
      };
    } catch (error) {
      handleError(error, "Lỗi khi tải giải đấu");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async (
    tournamentData: Partial<Tournament> & { imageFile?: File }
  ): Promise<Tournament> => {
    setLoading(true);
    try {
      let body: FormData | string;
      let headers: HeadersInit;

      if (tournamentData.imageFile) {
        // Use FormData for file upload
        const formData = new FormData();
        Object.entries(tournamentData).forEach(([key, value]) => {
          if (key !== "imageFile" && value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        formData.append("image", tournamentData.imageFile);

        body = formData;
        headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      } else {
        // Use JSON for regular data
        body = JSON.stringify(tournamentData);
        headers = getAuthHeaders();
      }

      const response = await fetch(`${apiUrl}/admin/tournaments`, {
        method: "POST",
        headers,
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create tournament");
      }

      return data.tournament;
    } catch (error) {
      handleError(error, "Lỗi khi tạo giải đấu");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTournament = async (
    id: number,
    tournamentData: Partial<Tournament> & { imageFile?: File }
  ): Promise<Tournament> => {
    setLoading(true);
    try {
      let body: FormData | string;
      let headers: HeadersInit;

      if (tournamentData.imageFile) {
        // Use FormData for file upload
        const formData = new FormData();
        Object.entries(tournamentData).forEach(([key, value]) => {
          if (key !== "imageFile" && value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        formData.append("image", tournamentData.imageFile);

        body = formData;
        headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      } else {
        // Use JSON for regular data
        body = JSON.stringify(tournamentData);
        headers = getAuthHeaders();
      }

      const response = await fetch(`${apiUrl}/admin/tournaments/${id}`, {
        method: "PUT",
        headers,
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update tournament");
      }

      return data.tournament;
    } catch (error) {
      handleError(error, "Lỗi khi cập nhật giải đấu");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTournament = async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/tournaments/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete tournament");
      }

      return true;
    } catch (error) {
      handleError(error, "Lỗi khi xóa giải đấu");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // =============== TEAMS ===============

  const getAllTeams = async (): Promise<Team[]> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/teams`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch teams");
      }

      return data.teams || [];
    } catch (error) {
      handleError(error, "Lỗi khi tải đội");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTeamsByTournament = async (
    tournamentId: number
  ): Promise<Team[]> => {
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/admin/tournaments/${tournamentId}/teams`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch teams");
      }

      return data.teams || [];
    } catch (error) {
      handleError(error, "Lỗi khi tải đội");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTeamsPaginated = async (
    search: string = "",
    sport: string = "",
    tournament: string = "",
    limit: number = 10,
    page: number = 1
  ): Promise<{
    teams: Team[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (sport) params.append("sport", sport);
      if (tournament) params.append("tournament", tournament);
      params.append("limit", limit.toString());
      params.append("page", page.toString());

      const response = await fetch(
        `${apiUrl}/admin/teams/paginated?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch paginated teams");
      }

      return {
        teams: data.teams || [],
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 0,
      };
    } catch (error) {
      handleError(error, "Lỗi khi tải đội");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData: Partial<Team>): Promise<Team> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/teams`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(teamData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create team");
      }

      return data.team;
    } catch (error) {
      handleError(error, "Lỗi khi tạo đội");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (
    id: number,
    teamData: Partial<Team>
  ): Promise<Team> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/teams/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(teamData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update team");
      }

      return data.team;
    } catch (error) {
      handleError(error, "Lỗi khi cập nhật đội");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/teams/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete team");
      }

      return true;
    } catch (error) {
      handleError(error, "Lỗi khi xóa đội");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: CategoryContextType = {
    loading,

    // Statistics
    getStats,

    // Categories
    getAllCategories,
    getCategoryById,
    getCategoriesPaginated,
    createCategory,
    updateCategory,
    deleteCategory,

    // Sports
    getAllSports,
    getSportsPaginated,
    createSport,
    updateSport,
    deleteSport,

    // Tournaments
    getAllTournaments,
    getTournamentsBySport,
    getTournamentsPaginated,
    createTournament,
    updateTournament,
    deleteTournament,

    // Teams
    getAllTeams,
    getTeamsByTournament,
    getTeamsPaginated,
    createTeam,
    updateTeam,
    deleteTeam,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory must be used within CategoryProvider");
  }
  return context;
};

// Export types for use in components
export type { Category, Sport, Tournament, Team, CategoryStats };
