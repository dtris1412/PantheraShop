import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./authContext";

interface CartItem {
  id: string;
  product_id: number;
  name: string;
  price: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
}

const CartContext = createContext<{
  cartItemCount: number;
  refresh: () => void;
  cartItems: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, change: number) => void;
  updateCartVariant: (id: string, variant: Partial<CartItem>) => void;
}>(undefined as any);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const refresh = () => {
    if (isAuthenticated && token) {
      let user_id = "";
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        user_id = payload.user_id;
      } catch {}
      if (!user_id) return;
      fetch(`http://localhost:8080/api/cart/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((cartData) => {
          if (!cartData.cart_id) {
            setCartItemCount(0);
            setCartItems([]);
            return;
          }
          // Lấy số lượng
          fetch(`http://localhost:8080/api/cart/count/${cartData.cart_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => {
              setCartItemCount(data.count || 0);
            });
          // Lấy danh sách sản phẩm
          fetch(`http://localhost:8080/api/cart/items/${cartData.cart_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((items) => {
              setCartItems(Array.isArray(items) ? items : []);
            });
        });
    } else {
      // Guest: lấy từ localStorage
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItemCount(Array.isArray(cart) ? cart.length : 0);
      setCartItems(Array.isArray(cart) ? cart : []);
    }
  };

  useEffect(() => {
    refresh();
  }, [isAuthenticated, token]);

  // Guest: thêm sản phẩm
  const addItem = (item: CartItem) => {
    if (isAuthenticated && token) {
      // Gọi API thêm cho user (tùy backend)
      // Sau khi thêm thành công, gọi refresh()
      refresh();
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart.push(item);
      localStorage.setItem("cart", JSON.stringify(cart));
      refresh();
    }
  };

  // Guest: xóa sản phẩm
  const removeItem = (id: string) => {
    if (isAuthenticated && token) {
      // Gọi API xóa cho user (tùy backend)
      refresh();
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const newCart = cart.filter(
        (item: CartItem) => String(item.id) !== String(id)
      );
      localStorage.setItem("cart", JSON.stringify(newCart));
      refresh();
    }
  };

  // Guest: cập nhật số lượng
  const updateQuantity = (id: string, change: number) => {
    if (isAuthenticated && token) {
      // Gọi API cập nhật cho user (tùy backend)
      refresh();
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const newCart = cart.map((item: CartItem) =>
        item.id === id ? { ...item, quantity: item.quantity + change } : item
      );
      localStorage.setItem("cart", JSON.stringify(newCart));
      refresh();
    }
  };

  // Guest: đổi variant
  const updateCartVariant = (id: string, variant: Partial<CartItem>) => {
    if (isAuthenticated && token) {
      // Gọi API đổi variant cho user (tùy backend)
      refresh();
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const newCart = cart.map((item: CartItem) =>
        item.id === id ? { ...item, ...variant } : item
      );
      localStorage.setItem("cart", JSON.stringify(newCart));
      refresh();
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItemCount,
        refresh,
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        updateCartVariant,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
