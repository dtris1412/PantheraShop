import { createContext, useContext, useState } from "react";
export const OrderContext = createContext<any>(null);
export const useOrder = () => useContext(OrderContext);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  return (
    <OrderContext.Provider value={{ orderItems, setOrderItems }}>
      {children}
    </OrderContext.Provider>
  );
}
