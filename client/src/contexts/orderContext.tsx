import { createContext, useContext, useState } from "react";
export const OrderContext = createContext<any>(null);
export const useOrder = () => useContext(OrderContext);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderSource, setOrderSource] = useState<"cart" | "buyAgain">("cart");
  return (
    <OrderContext.Provider
      value={{ orderItems, setOrderItems, orderSource, setOrderSource }}
    >
      {children}
    </OrderContext.Provider>
  );
}
