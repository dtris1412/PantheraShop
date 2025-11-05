import React, { createContext, useContext, useState } from "react";

export interface Supplier {
  supplier_id: number | string;
  supplier_name: string;
  supplier_phone?: string;
  supplier_email?: string;
  supplier_address?: string;
  supplier_type?: string;
  is_active?: boolean;
  created_at?: string;
}

interface SupplierContextType {
  suppliers: Supplier[];
  loading: boolean;
  fetchSuppliers: () => Promise<void>;
  createSupplier: (data: Partial<Supplier>) => Promise<void>;
  updateSupplier: (
    id: number | string,
    data: Partial<Supplier>
  ) => Promise<void>;
  setConnectionStatus: (
    id: number | string,
    is_connected: boolean
  ) => Promise<void>;
}

const SupplierContext = createContext<SupplierContextType | undefined>(
  undefined
);

export const SupplierProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/admin/suppliers", {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      const data = await res.json();
      // Ánh xạ is_connected -> is_active để code cũ không cần sửa nhiều
      const mapped = Array.isArray(data.suppliers)
        ? data.suppliers.map((s: any) => ({
            ...s,
            is_active: s.is_connected, // ánh xạ trạng thái
          }))
        : [];
      setSuppliers(mapped);
    } catch (e) {
      setSuppliers([]);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (data: Partial<Supplier>) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/admin/suppliers", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create supplier");
      await fetchSuppliers();
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async (
    id: number | string,
    data: Partial<Supplier>
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/admin/suppliers/${id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to update supplier");
      await fetchSuppliers();
    } finally {
      setLoading(false);
    }
  };

  const setConnectionStatus = async (
    id: number | string,
    is_connected: boolean
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/admin/suppliers/${id}/connection-status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ is_connected }),
        }
      );
      if (!res.ok) throw new Error("Failed to update connection status");
      await fetchSuppliers();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        loading,
        fetchSuppliers,
        createSupplier,
        updateSupplier,
        setConnectionStatus,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
};

export const useSupplier = () => {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error("useSupplier must be used within SupplierProvider");
  return ctx;
};
