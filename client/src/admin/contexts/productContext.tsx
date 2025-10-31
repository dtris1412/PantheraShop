import React, { createContext, useContext, useState, ReactNode } from "react";

interface Category {
  category_id: number;
  category_name: string;
  description: string | null;
}

interface Product {
  product_id: number;
  product_name: string;
  product_description: string | null;
  product_price: number | string; //Chấp nhận cả string và number
  category_id: number;
  product_image: string | null;
  created_at: string;
  stock: number;
  average_rating: number;
  Category?: Category;
}

interface ProductContextType {
  getAllProducts: () => Promise<Product[]>;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const getAllProducts = async (): Promise<Product[]> => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/admin/products", {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();

      // API returns array directly, not wrapped in object
      if (Array.isArray(data)) {
        console.log(`✅ Loaded ${data.length} products`);
        return data;
      }

      // Fallback for wrapped format
      if (data.products && Array.isArray(data.products)) {
        console.log(`✅ Loaded ${data.products.length} products`);
        return data.products;
      }

      console.warn("⚠️ Unexpected response format:", data);
      return [];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        getAllProducts,
        loading,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within ProductProvider");
  }
  return context;
};
