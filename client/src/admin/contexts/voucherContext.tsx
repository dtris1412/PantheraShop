import React, { createContext, useContext, useState, ReactNode } from "react";
const apiUrl = import.meta.env.VITE_API_URL;
export interface Voucher {
  voucher_id: number;
  voucher_code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  used_count: number;
  voucher_status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateVoucherData {
  voucher_code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  voucher_status: string;
}

interface VoucherContextType {
  vouchers: Voucher[];
  getAllVouchers: () => Promise<void>;
  getVouchersPaginated: (params: {
    search?: string;
    discount_type?: string;
    voucher_status?: string;
    limit?: number;
    page?: number;
  }) => Promise<any>;
  createVoucher: (voucherData: CreateVoucherData) => Promise<any>;
  updateVoucher: (
    voucherId: number,
    voucherData: Partial<Voucher>
  ) => Promise<any>;
  loading: boolean;
}

const VoucherContext = createContext<VoucherContextType | undefined>(undefined);

interface VoucherProviderProps {
  children: ReactNode;
}

export const VoucherProvider: React.FC<VoucherProviderProps> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  const getAllVouchers = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/admin/vouchers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch vouchers");
      }

      const data = await res.json();
      setVouchers(data.success ? data.data : []);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setVouchers([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getVouchersPaginated = async (params: {
    search?: string;
    discount_type?: string;
    voucher_status?: string;
    limit?: number;
    page?: number;
  }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append("search", params.search);
      if (params.discount_type)
        queryParams.append("discount_type", params.discount_type);
      if (params.voucher_status)
        queryParams.append("voucher_status", params.voucher_status);
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.page) queryParams.append("page", params.page.toString());

      const res = await fetch(
        `${apiUrl}/admin/vouchers/paginated?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch paginated vouchers");
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching paginated vouchers:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createVoucher = async (voucherData: CreateVoucherData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/admin/vouchers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(voucherData),
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

  const updateVoucher = async (
    voucherId: number,
    voucherData: Partial<Voucher>
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/admin/vouchers/${voucherId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(voucherData),
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

  return (
    <VoucherContext.Provider
      value={{
        vouchers,
        getAllVouchers,
        getVouchersPaginated,
        createVoucher,
        updateVoucher,
        loading,
      }}
    >
      {children}
    </VoucherContext.Provider>
  );
};

export const useVoucher = () => {
  const context = useContext(VoucherContext);
  if (!context) {
    throw new Error("useVoucher must be used within VoucherProvider");
  }
  return context;
};
