import React, { createContext, useContext, useState, ReactNode } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export interface DashboardStats {
  users: { value: number; trend: { value: string; isPositive: boolean } };
  orders: { value: number; trend: { value: string; isPositive: boolean } };
  products: { value: number; trend: { value: string; isPositive: boolean } };
  revenue: { value: number; trend: { value: string; isPositive: boolean } };
}

interface MonthlySalesItem {
  month: number;
  value: number;
}

interface RecentOrder {
  order_id: number;
  user_id: number;
  order_status: string;
  total_amount: number;
  order_date: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  payment_method?: string;
  payment_status?: string;
  payment_type?: string;
  shipping_fee?: number;
  tax?: number;
  orderProducts?: any[];
}

interface DashboardContextType {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchUsers: (year: number, month: number) => Promise<number | null>;
  fetchOrders: (year: number, month: number) => Promise<number | null>;
  fetchProducts: (year: number, month: number) => Promise<number | null>;
  fetchRevenue: (year: number, month: number) => Promise<number | null>;
  fetchMonthlySales: (year: number) => Promise<MonthlySalesItem[]>;
  recentOrders: RecentOrder[] | null;
  fetchRecentOrders: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[] | null>(null);

  // Get token from localStorage
  const getToken = () => localStorage.getItem("token");

  // Fetch tổng hợp stats
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || "Không thể lấy dữ liệu dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi lấy dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Fetch từng loại stats theo tháng
  const fetchUsers = async (
    year: number,
    month: number
  ): Promise<number | null> => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/admin/dashboard/users?year=${year}&month=${month}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data.count ?? null;
    } catch {
      return null;
    }
  };

  const fetchOrders = async (
    year: number,
    month: number
  ): Promise<number | null> => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/admin/dashboard/orders?year=${year}&month=${month}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data.count ?? null;
    } catch {
      return null;
    }
  };

  const fetchProducts = async (
    year: number,
    month: number
  ): Promise<number | null> => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/admin/dashboard/products?year=${year}&month=${month}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data.count ?? null;
    } catch {
      return null;
    }
  };

  const fetchRevenue = async (
    year: number,
    month: number
  ): Promise<number | null> => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/admin/dashboard/revenue?year=${year}&month=${month}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data.total ?? null;
    } catch {
      return null;
    }
  };

  const fetchMonthlySales = async (
    year: number
  ): Promise<MonthlySalesItem[]> => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/admin/dashboard/monthly-sales?year=${year}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data.sales ?? [];
    } catch {
      return [];
    }
  };

  const fetchRecentOrders = async () => {
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/dashboard/recent-orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setRecentOrders(data.data); // Sửa từ data.orders thành data.data
      } else {
        setError(data.message || "Không thể lấy đơn hàng gần đây");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi lấy đơn hàng gần đây");
    }
  };

  const value: DashboardContextType = {
    stats,
    loading,
    error,
    fetchStats,
    fetchUsers,
    fetchOrders,
    fetchProducts,
    fetchRevenue,
    fetchMonthlySales,
    recentOrders,
    fetchRecentOrders,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
