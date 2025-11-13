import React, { createContext, useContext, useState, useCallback } from "react";
const apiUrl = import.meta.env.VITE_API_URL;
export interface ProductImage {
  product_image_id: number;
  product_id: number;
  image_url: string;
  order: number;
  Product?: {
    product_id: number;
    product_name: string;
    product_image: string;
  };
}

interface PaginatedProductImagesResponse {
  data: ProductImage[];
  total: number;
  page: number;
  totalPages: number;
}

interface ProductImageContextType {
  images: ProductImage[];
  loading: boolean;
  fetchAllImages: () => Promise<void>;
  fetchImagesByProductId: (
    productId: number | string
  ) => Promise<ProductImage[]>;
  getProductImagesPaginated: (
    search: string,
    limit: number,
    page: number
  ) => Promise<PaginatedProductImagesResponse>;
  uploadGalleryImage: (file: File) => Promise<string>; // trả về url
  createProductImage: (data: {
    product_id: number;
    image_url: string;
    order?: number;
  }) => Promise<any>;
  updateProductImage: (id: number, data: Partial<ProductImage>) => Promise<any>;
  deleteProductImage: (id: number) => Promise<any>;
}

const ProductImageContext = createContext<ProductImageContextType | undefined>(
  undefined
);

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const ProductImageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/product-images`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch product images");
      const data = await res.json();
      setImages(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setImages([]);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []); // <-- useCallback để giữ reference

  const fetchImagesByProductId = async (productId: number | string) => {
    // KHÔNG setLoading ở đây!
    const res = await fetch(`${apiUrl}/admin/product-images/${productId}`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!res.ok)
      throw new Error("Failed to fetch product images by product id");
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  };

  const getProductImagesPaginated = async (
    search: string,
    limit: number,
    page: number
  ): Promise<PaginatedProductImagesResponse> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("limit", limit.toString());
    params.append("page", page.toString());

    const res = await fetch(
      `${apiUrl}/admin/product-images/paginated?${params}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error("Failed to fetch paginated product images");
    const json = await res.json();
    return {
      data: json.data || [],
      total: json.total || 0,
      page: json.page || 1,
      totalPages: json.totalPages || 1,
    };
  };

  const uploadGalleryImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const token = localStorage.getItem("token");
    const res = await fetch(`${apiUrl}/admin/upload-gallery-image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Upload gallery image failed");
    const data = await res.json();
    return data.url || data.imageUrl || data.data?.url; // thêm data.imageUrl
  };

  const createProductImage = async (data: {
    product_id: number;
    image_url: string;
    order?: number;
  }) => {
    const res = await fetch(`${apiUrl}/admin/product-images`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Create product image failed");
    return res.json();
  };

  const updateProductImage = async (
    id: number,
    data: Partial<ProductImage>
  ) => {
    const res = await fetch(`${apiUrl}/admin/product-images/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Update product image failed");
    return res.json();
  };

  const deleteProductImage = async (id: number) => {
    const res = await fetch(`${apiUrl}/admin/product-images/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Delete product image failed");
    return res.json();
  };

  return (
    <ProductImageContext.Provider
      value={{
        images,
        loading,
        fetchAllImages,
        fetchImagesByProductId,
        getProductImagesPaginated,
        uploadGalleryImage,
        createProductImage,
        updateProductImage,
        deleteProductImage,
      }}
    >
      {children}
    </ProductImageContext.Provider>
  );
};

export const useProductImageContext = () => {
  const ctx = useContext(ProductImageContext);
  if (!ctx)
    throw new Error(
      "useProductImageContext must be used within ProductImageProvider"
    );
  return ctx;
};
