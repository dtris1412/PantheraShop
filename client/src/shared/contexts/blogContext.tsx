import React, {
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
  // ...thêm các trường khác nếu cần
}

interface BlogContextType {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const BlogContext = createContext<BlogContextType>({
  blogs: [],
  loading: false,
  error: null,
  refetch: () => {},
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
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}
