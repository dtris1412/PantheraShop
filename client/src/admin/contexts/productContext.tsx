import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

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

interface ProductVariant {
  variant_size: string;
  variant_color: string;
  variant_stock: number;
}

interface CreateProductData {
  product_name: string;
  product_description: string;
  product_price: string | number;
  category_id: string | number;
  team_id?: string | number;
  product_image?: string;
  variants?: ProductVariant[];
}

interface ProductContextType {
  getAllProducts: () => Promise<Product[]>;
  getProductById: (id: number) => Promise<Product | null>;
  createProduct: (
    productData: CreateProductData,
    imageFile?: File | null
  ) => Promise<any>;
  updateProduct: (
    id: number,
    productData: CreateProductData,
    imageFile?: File | null
  ) => Promise<any>;
  deleteProduct: (id: number) => Promise<boolean>;
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

  const getProductById = useCallback(
    async (id: number): Promise<Product | null> => {
      // KHÔNG setLoading ở đây để tránh gây re-render toàn bộ context
      // Component gọi hàm này sẽ tự quản lý loading state
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:8080/api/admin/products/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch product");
        }

        const data = await res.json();
        if (data.success && data.product) {
          return data.product;
        }
        return null;
      } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw error;
      }
    },
    []
  );

  const createProduct = async (
    productData: CreateProductData,
    imageFile?: File | null
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let product_image = productData.product_image;

      // Upload image to Cloudinary if provided
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadRes = await fetch(
          "http://localhost:8080/api/admin/upload-product-image",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.imageUrl) {
            product_image = uploadData.imageUrl;
          }
        }
      }

      // Create product with variants
      const payload = {
        ...productData,
        product_image,
        product_price:
          typeof productData.product_price === "string"
            ? parseFloat(productData.product_price)
            : productData.product_price,
        category_id:
          typeof productData.category_id === "string"
            ? parseInt(productData.category_id)
            : productData.category_id,
        team_id: productData.team_id
          ? typeof productData.team_id === "string"
            ? parseInt(productData.team_id)
            : productData.team_id
          : undefined,
      };

      const res = await fetch("http://localhost:8080/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      const data = await res.json();
      console.log("✅ Product created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    id: number,
    productData: CreateProductData,
    imageFile?: File | null
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let product_image = productData.product_image;

      // Upload new image to Cloudinary if provided
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadRes = await fetch(
          "http://localhost:8080/api/admin/upload-product-image",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.imageUrl) {
            product_image = uploadData.imageUrl;
          }
        }
      }

      // Update product with variants
      const payload = {
        ...productData,
        product_image,
        product_price:
          typeof productData.product_price === "string"
            ? parseFloat(productData.product_price)
            : productData.product_price,
        category_id:
          typeof productData.category_id === "string"
            ? parseInt(productData.category_id)
            : productData.category_id,
        team_id: productData.team_id
          ? typeof productData.team_id === "string"
            ? parseInt(productData.team_id)
            : productData.team_id
          : undefined,
      };

      const res = await fetch(
        `http://localhost:8080/api/admin/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      const data = await res.json();
      console.log("✅ Product updated successfully:", data);
      return data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/admin/products/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete product");
      }

      console.log("✅ Product deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        getAllProducts,
        getProductById,
        createProduct,
        updateProduct,
        deleteProduct,
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
