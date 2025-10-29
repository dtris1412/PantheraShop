import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  user_address: string | null;
  role_id: number;
  created_at: string | null;
  avatar: string | null;
  user_status: boolean;
}

interface CreateUserData {
  user_name: string;
  user_email: string;
  user_password: string;
  user_phone?: string;
  user_address?: string;
  role_id: number;
  avatar?: string;
  user_status?: boolean; // Default active status
}

interface AdminContextType {
  getAllUsers: () => Promise<User[]>;
  createUser: (userData: CreateUserData) => Promise<any>;
  updateUserStatus: (userId: number, shouldLock?: boolean) => Promise<any>;
  uploadAvatar: (file: File) => Promise<string>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const getAllUsers = async (): Promise<User[]> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Add default active status if not provided
      const userDataWithStatus = {
        ...userData,
        user_status:
          userData.user_status !== undefined ? userData.user_status : true,
      };

      const res = await fetch("http://localhost:8080/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userDataWithStatus),
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

  const updateUserStatus = async (userId: number, shouldLock?: boolean) => {
    // Don't set global loading for this action to avoid page reload effect
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/admin/users/status/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ shouldLock }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/admin/upload-avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data.avatar_url;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        getAllUsers,
        createUser,
        updateUserStatus,
        uploadAvatar,
        loading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};
