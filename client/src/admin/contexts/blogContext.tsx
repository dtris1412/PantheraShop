import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Blog {
  blog_id: number;
  blog_title: string;
  blog_content: string;
  blog_thumbnail: string;
  user_id: number;
  sport_id?: number;
  team_id?: number;
  category_id?: number;
  tournament_id?: number;
  created_at?: string;
  updated_at?: string;
  User?: {
    user_id: number;
    user_name: string;
  };
  Sport?: {
    sport_id: number;
    sport_name: string;
  };
  Team?: {
    team_id: number;
    team_name: string;
  };
  Category?: {
    category_id: number;
    category_name: string;
  };
  Tournament?: {
    tournament_id: number;
    tournament_name: string;
  };
}

export interface CreateBlogData {
  blog_title: string;
  blog_content: string;
  blog_thumbnail: string;
  sport_id?: number;
  team_id?: number;
  category_id?: number;
  tournament_id?: number;
}

interface BlogContextType {
  blogs: Blog[];
  getAllBlogs: () => Promise<void>;
  getBlogById: (blogId: number) => Promise<Blog | null>;
  createBlog: (blogData: CreateBlogData) => Promise<any>;
  updateBlog: (
    blogId: number,
    blogData: Partial<CreateBlogData>
  ) => Promise<any>;
  deleteBlog: (blogId: number) => Promise<any>;
  loading: boolean;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

interface BlogProviderProps {
  children: ReactNode;
}

export const BlogProvider: React.FC<BlogProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const getAllBlogs = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/admin/blogs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch blogs");
      }

      const data = await res.json();
      setBlogs(data.success ? data.blogs : []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setBlogs([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getBlogById = async (blogId: number): Promise<Blog | null> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/admin/blogs/${blogId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch blog");
      }

      const data = await res.json();
      return data.success ? data.blog : null;
    } catch (error) {
      console.error("Error fetching blog:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createBlog = async (blogData: CreateBlogData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(blogData),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBlog = async (
    blogId: number,
    blogData: Partial<CreateBlogData>
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/admin/blogs/${blogId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(blogData),
        }
      );

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (blogId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/admin/blogs/${blogId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlogContext.Provider
      value={{
        blogs,
        getAllBlogs,
        getBlogById,
        createBlog,
        updateBlog,
        deleteBlog,
        loading,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("useBlog must be used within BlogProvider");
  }
  return context;
};
