import { createContext, useContext, useEffect, useState } from "react";

export interface Sport {
  sport_id: number | string;
  sport_name: string;
  sport_icon: string;
}
export interface Category {
  category_id: number | string;
  category_name: string;
  // ...các trường khác nếu có
}

export interface Tournament {
  tournament_id: number | string;
  tournament_name: string;
  Sport?: Sport;
}

export interface Team {
  team_id: number | string;
  team_name: string;
  Tournament?: Tournament;
}

export interface Product {
  product_id: number | string;
  product_name: string;
  product_price: number;
  product_image: string;
  product_rating: number;
  product_description?: string;
  release_date?: string;
  Team?: Team;
  Category?: Category;
  // ...các trường khác nếu cần
}

interface ProductContextType {
  products: Product[];
  topProducts: Product[];
  sports: Sport[];
  fetchProducts: () => Promise<void>;
  fetchTopProducts: () => Promise<void>;
  fetchSports: () => Promise<void>;
  fetchFilteredProducts: (filters: any) => Promise<void>;
  searchProducts: (keyword: string) => Promise<Product[]>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);

  const mapProductPrice = (arr: any[]): Product[] =>
    arr.map((p) => ({
      ...p,
      product_price: Number(p.product_price),
    }));

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? mapProductPrice(data) : []);
    } catch {
      setProducts([]);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/products/top-rated");
      const data = await res.json();
      setTopProducts(Array.isArray(data) ? mapProductPrice(data) : []);
    } catch {
      setTopProducts([]);
    }
  };

  const fetchSports = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/sports");
      const data = await res.json();
      setSports(Array.isArray(data) ? data : []);
    } catch {
      setSports([]);
    }
  };

  const fetchFilteredProducts = async (filters: any) => {
    try {
      const res = await fetch("http://localhost:8080/api/products/filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? mapProductPrice(data) : []);
    } catch {
      setProducts([]);
    }
  };
  const searchProducts = async (keyword: string): Promise<Product[]> => {
    if (!keyword) return [];
    try {
      const res = await fetch(
        `http://localhost:8080/api/products/search?query=${encodeURIComponent(
          keyword
        )}`
      );
      const data = await res.json();
      return Array.isArray(data) ? mapProductPrice(data) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTopProducts();
    fetchSports();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        topProducts,
        sports,
        fetchProducts,
        fetchTopProducts,
        fetchSports,
        fetchFilteredProducts,
        searchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProduct must be used within ProductProvider");
  return ctx;
};
