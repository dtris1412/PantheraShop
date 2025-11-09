import { createContext, useContext, useState } from "react";
const apiUrl = import.meta.env.VITE_API_URL;
export interface Variant {
  variant_id: number | string;
  variant_size?: string;
  variant_color?: string;
  variant_stock: number;
  product_id: number | string;
  product_name?: string; // Thêm dòng này
  product_image?: string; // Thêm dòng này
  created_at?: string;
}

export interface Product {
  product_id: number | string;
  product_name: string;
  product_description?: string;
  product_price: number | string;
  product_image?: string;
  created_at?: string;
  is_active?: boolean;
  Variant?: Variant[] | Variant | null;
}

interface InventoryContextType {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  createVariant: (variant: Partial<Variant>) => Promise<void>;
  updateVariant: (
    variant_id: number | string,
    data: Partial<Variant>
  ) => Promise<void>;
  deleteVariant: (variant_id: number | string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export const InventoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Lấy tất cả sản phẩm (có biến thể)
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/inventory`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();

      // API trả về { success: true, products: [variants...] }
      // Mỗi variant có Product nested
      let variants: any[] = [];
      if (Array.isArray(data)) {
        variants = data;
      } else if (data.products && Array.isArray(data.products)) {
        variants = data.products;
      }

      // Group variants by product
      const productMap = new Map<number | string, Product>();

      variants.forEach((variant: any) => {
        const productId = variant.Product?.product_id || variant.product_id;

        if (!productMap.has(productId)) {
          // Create new product entry
          productMap.set(productId, {
            product_id: productId,
            product_name: variant.Product?.product_name || "",
            product_description: variant.Product?.product_description || "",
            product_price: variant.Product?.product_price || 0,
            product_image: variant.Product?.product_image || "",
            created_at: variant.Product?.created_at || "",
            is_active: variant.Product?.is_active ?? true,
            Variant: [],
          });
        }

        // Add variant to product's Variant array
        const product = productMap.get(productId)!;
        if (Array.isArray(product.Variant)) {
          product.Variant.push({
            variant_id: variant.variant_id,
            variant_size: variant.variant_size,
            variant_color: variant.variant_color,
            variant_stock: variant.variant_stock,
            product_id: productId,
            product_name: variant.Product?.product_name,
            product_image: variant.Product?.product_image,
            created_at: variant.created_at,
          });
        }
      });

      setProducts(Array.from(productMap.values()));
    } catch (error) {
      setProducts([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Tạo biến thể mới
  const createVariant = async (variantData: Partial<Variant>) => {
    setLoading(true);
    try {
      const payload = {
        ...variantData,
        variant_size: variantData.variant_size || "Standard",
        variant_color: variantData.variant_color || "Default",
        variant_stock: variantData.variant_stock || 0,
        product_id:
          typeof variantData.product_id === "string"
            ? parseInt(variantData.product_id as string)
            : variantData.product_id,
      };

      const res = await fetch(`${apiUrl}/admin/inventory`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create variant");
      }

      await fetchProducts();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật biến thể
  const updateVariant = async (
    variant_id: number | string,
    variantData: Partial<Variant>
  ) => {
    setLoading(true);
    try {
      const payload = {
        variant_size: variantData.variant_size,
        variant_color: variantData.variant_color,
        variant_stock: variantData.variant_stock,
      };

      const res = await fetch(`${apiUrl}/admin/inventory/${variant_id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update variant");
      }

      await fetchProducts();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Xóa biến thể
  const deleteVariant = async (variant_id: number | string) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/inventory/${variant_id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete variant");
      }

      await fetchProducts();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        loading,
        fetchProducts,
        createVariant,
        updateVariant,
        deleteVariant,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx)
    throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
};
