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
}

interface AdminContextType {
  getAllUsers: () => Promise<User[]>;
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

  return (
    <AdminContext.Provider
      value={{
        getAllUsers,
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
