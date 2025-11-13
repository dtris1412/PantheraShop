import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
const apiUrl = import.meta.env.VITE_API_URL;
export interface Blog {
  blog_id: number;
  blog_title: string;
  blog_content: string;
  created_at: string;
  updated_at: string;
  blog_thumbnail?: string;
  user_id?: number;
  sport_id?: number;
  team_id?: number;
  category_id?: number;
  tournament_id?: number;
}

interface PaginatedBlogsResponse {
  blogs: Blog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface BlogContextType {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  getBlogsPaginated: (
    search: string,
    sport_id: string,
    category_id: string,
    team_id: string,
    tournament_id: string,
    limit: number,
    page: number
  ) => Promise<PaginatedBlogsResponse>;
}

const BlogContext = createContext<BlogContextType>({
  blogs: [],
  loading: false,
  error: null,
  refetch: () => {},
  getBlogsPaginated: async () => ({
    blogs: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  }),
});

export const useBlogContext = () => useContext(BlogContext);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/blogs`);
      const data = await res.json();
      if (data.success && data.data && Array.isArray(data.data.blogs)) {
        setBlogs(data.data.blogs);
      } else {
        setError("Không lấy được danh sách blog");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    }
    setLoading(false);
  };

  const getBlogsPaginated = async (
    search: string,
    sport_id: string,
    category_id: string,
    team_id: string,
    tournament_id: string,
    limit: number,
    page: number
  ): Promise<PaginatedBlogsResponse> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (sport_id) params.append("sport_id", sport_id);
    if (category_id) params.append("category_id", category_id);
    if (team_id) params.append("team_id", team_id);
    if (tournament_id) params.append("tournament_id", tournament_id);
    params.append("limit", limit.toString());
    params.append("page", page.toString());

    const res = await fetch(`${apiUrl}/blogs/paginated?${params}`);
    if (!res.ok) throw new Error("Failed to fetch paginated blogs");
    const json = await res.json();
    return {
      blogs: json.blogs || [],
      pagination: json.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <BlogContext.Provider
      value={{
        blogs,
        loading,
        error,
        refetch: fetchBlogs,
        getBlogsPaginated,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}
