import React, { createContext, useContext, useState, ReactNode } from "react";

interface Order {
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

interface OrderContextType {
  getAllOrders: () => Promise<Order[]>;
  getOrderHistoryByUserId: (userId: number) => Promise<Order[]>;
  approveOrder: (orderId: number, status: string) => Promise<any>;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const getAllOrders = async (): Promise<Order[]> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/admin/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getOrderHistoryByUserId = async (userId: number): Promise<Order[]> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/admin/orders/history/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch order history");
      }

      const data = await res.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Error fetching order history:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveOrder = async (orderId: number, status: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/admin/orders/${orderId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
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
    <OrderContext.Provider
      value={{
        getAllOrders,
        getOrderHistoryByUserId,
        approveOrder,
        loading,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within OrderProvider");
  }
  return context;
};
