import React, { createContext, useContext, useState, ReactNode } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export interface Report {
  report_id: number;
  report_type:
    | "revenue"
    | "orders"
    | "products"
    | "users"
    | "vouchers"
    | "blogs";
  created_at: string;
  from_date: string;
  to_date: string;
  filters: string;
  total_value: number;
  details: string;
  description: string;
  created_by: string;
}

export interface ReportFilters {
  payment_method?: string;
  order_status?: string;
  category_id?: number;
  user_status?: boolean;
  voucher_status?: string;
  sport_id?: number;
  registration_date?: boolean;
}

export interface PreviewReportData {
  report_type: string;
  from_date: string;
  to_date: string;
  total_value: number;
  details: any;
}

interface AdminReportContextType {
  reports: Report[];
  loading: boolean;
  error: string | null;
  getAllReports: () => Promise<void>;
  getReportById: (report_id: number) => Promise<Report | null>;
  createReport: (
    report_type: string,
    from_date: string,
    to_date: string,
    filters: ReportFilters,
    total_value: number,
    details: any
  ) => Promise<boolean>;
  deleteReport: (report_id: number) => Promise<boolean>;
}

const AdminReportContext = createContext<AdminReportContextType | undefined>(
  undefined
);

export const useAdminReport = () => {
  const context = useContext(AdminReportContext);
  if (!context) {
    throw new Error("useAdminReport must be used within AdminReportProvider");
  }
  return context;
};

interface AdminReportProviderProps {
  children: ReactNode;
}

export const AdminReportProvider: React.FC<AdminReportProviderProps> = ({
  children,
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Get all reports
  const getAllReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/reports`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch reports");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      } else {
        setError(data.message || "Failed to fetch reports");
      }
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      setError(err.message || "Error fetching reports");
    } finally {
      setLoading(false);
    }
  };

  // Get report by ID
  const getReportById = async (report_id: number): Promise<Report | null> => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/reports/${report_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch report");
        return null;
      }

      const data = await response.json();
      if (data.success) {
        return data.data;
      } else {
        setError(data.message || "Failed to fetch report");
        return null;
      }
    } catch (err: any) {
      console.error("Error fetching report:", err);
      setError(err.message || "Error fetching report");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create and save report (truyền dữ liệu đã tổng hợp từ frontend)
  const createReport = async (
    report_type: string,
    from_date: string,
    to_date: string,
    filters: ReportFilters,
    total_value: number,
    details: any
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          report_type,
          from_date,
          to_date,
          filters: filters || {},
          total_value,
          details,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await getAllReports(); // Refresh the list
        return true;
      } else {
        setError(data.message || "Failed to create report");
        return false;
      }
    } catch (err: any) {
      console.error("Error creating report:", err);
      setError(err.message || "Error creating report");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete report
  const deleteReport = async (report_id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/reports/${report_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        await getAllReports(); // Refresh the list
        return true;
      } else {
        setError(data.message || "Failed to delete report");
        return false;
      }
    } catch (err: any) {
      console.error("Error deleting report:", err);
      setError(err.message || "Error deleting report");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AdminReportContextType = {
    reports,
    loading,
    error,
    getAllReports,
    getReportById,
    createReport,
    deleteReport,
  };

  return (
    <AdminReportContext.Provider value={value}>
      {children}
    </AdminReportContext.Provider>
  );
};
