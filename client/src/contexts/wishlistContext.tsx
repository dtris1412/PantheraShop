import React, { createContext, useContext, useEffect, useState } from "react";
import { showToast } from "../components/Toast";
import { useAuth } from "./authContext";

interface Variant {
  wishlist_variant_id: number;
  variant_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  product_price?: number;
  product_rating?: number;
  product_description?: string;
  sport?: string;
  variant_size: string;
  variant_color: string;
  added_at: string;
}

interface WishlistContextType {
  variants: Variant[];
  wishlistId: number | null;
  loading: boolean;
  count: number;
  refresh: () => void;
  remove: (wishlist_variant_id: number, variant_id: number) => Promise<void>;
  changeVariant: (
    wishlist_variant_id: number,
    old_variant_id: number,
    newVariant: {
      variant_id: number;
      variant_size?: string;
      variant_color?: string;
    }
  ) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [wishlistId, setWishlistId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const { token, isAuthenticated } = useAuth();

  // Hàm load lại wishlist
  const refresh = () => {
    if (!token) return;
    let user_id = "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      user_id = payload.user_id;
    } catch {}
    if (!user_id) return;

    fetch(`http://localhost:8080/api/wishlist/${user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const wishlist_id = data?.wishlist_id;
        if (!wishlist_id) {
          setLoading(false);
          setVariants([]);
          setWishlistId(null);
          setCount(0);
          return;
        }
        setWishlistId(wishlist_id);

        // Lấy các variant trong wishlist
        fetch(
          `http://localhost:8080/api/wishlist/wishlist-items/${wishlist_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
          .then((res) => res.json())
          .then((itemsRes) => {
            const arr = Array.isArray(itemsRes.items) ? itemsRes.items : [];
            const normalized = arr.map((item: any) => ({
              wishlist_variant_id: item.wishlist_variant_id,
              variant_id: item.variant_id,
              product_id: item.Variant?.Product?.product_id,
              product_name: item.Variant?.Product?.product_name || "",
              product_image: item.Variant?.Product?.product_image || "",
              product_price: item.Variant?.Product?.product_price || 0,
              product_rating: item.Variant?.Product?.product_rating || 0,
              product_description:
                item.Variant?.Product?.product_description || "",
              sport: item.Variant?.Product?.sport_name || "",
              variant_size: item.Variant?.variant_size || "",
              variant_color: item.Variant?.variant_color || "",
              added_at: item.added_at,
            }));
            setVariants(normalized);
            setCount(normalized.length);
            setLoading(false);
          });
      });
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      refresh();
    } else {
      setVariants([]);
      setWishlistId(null);
      setCount(0);
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Xóa item khỏi wishlist
  async function remove(wishlist_variant_id: number, variant_id: number) {
    if (!wishlistId) {
      showToast("Không tìm thấy wishlist!", "error");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:8080/api/wishlist/remove/${wishlistId}/${variant_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        showToast("Đã xóa khỏi danh sách yêu thích!", "success");
        setVariants((prev) =>
          prev.filter((v) => v.wishlist_variant_id !== wishlist_variant_id)
        );
        setCount((prev) => prev - 1);
      } else {
        showToast("Xóa thất bại!", "error");
      }
    } catch {
      showToast("Xóa thất bại!", "error");
    }
  }

  // Đổi variant
  async function changeVariant(
    wishlist_variant_id: number,
    old_variant_id: number,
    newVariant: {
      variant_id: number;
      variant_size?: string;
      variant_color?: string;
    }
  ) {
    if (!wishlistId) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/wishlist/change-variant/${wishlistId}/${old_variant_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ new_variant_id: newVariant.variant_id }),
        }
      );
      const data = await res.json();
      if (data.success) {
        showToast("Đã đổi phân loại thành công!", "success");
        setVariants((prev) =>
          prev.map((v) =>
            v.wishlist_variant_id === wishlist_variant_id
              ? {
                  ...v,
                  variant_id: newVariant.variant_id,
                  variant_size: newVariant.variant_size ?? v.variant_size,
                  variant_color: newVariant.variant_color ?? v.variant_color,
                }
              : v
          )
        );
      } else {
        showToast(data.message || "Đổi phân loại thất bại!", "error");
      }
    } catch {
      showToast("Đổi phân loại thất bại!", "error");
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        variants,
        wishlistId,
        loading,
        count,
        refresh,
        remove,
        changeVariant,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
