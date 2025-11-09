import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./authContext";
const apiUrl = import.meta.env.VITE_API_URL;

export const OrderHistoryContext = createContext<any>(null);
export const useOrderHistory = () => useContext(OrderHistoryContext);

export function OrderHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      if (!isAuthenticated || !token) {
        setOrders([]);
        setLoading(false);
        return;
      }
      let user_id = "";
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        user_id = payload.user_id;
      } catch {}
      if (!user_id) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const res = await fetch(`${apiUrl}/orders/user/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.data || []);
      setLoading(false);
    }
    fetchOrders();
  }, [token, isAuthenticated]);

  return (
    <OrderHistoryContext.Provider value={{ orders, loading }}>
      {children}
    </OrderHistoryContext.Provider>
  );
}
