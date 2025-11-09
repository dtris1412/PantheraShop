import React, { createContext, useContext, useState, ReactNode } from "react";

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
      const res = await fetch("http://localhost:8080/api/admin/vouchers", {
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

  const createVoucher = async (voucherData: CreateVoucherData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/admin/vouchers", {
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
      const res = await fetch(
        `http://localhost:8080/api/admin/vouchers/${voucherId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(voucherData),
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
    <VoucherContext.Provider
      value={{
        vouchers,
        getAllVouchers,
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
