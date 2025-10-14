import { createContext, useContext, useEffect, useState } from "react";

export interface Sport {
  sport_id: number | string;
  sport_name: string;
  sport_icon: string;
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
  Team?: Team;
  // ...các trường khác nếu cần
}

interface ProductContextType {
  products: Product[];
  topProducts: Product[];
  sports: Sport[];
  fetchProducts: () => Promise<void>;
  fetchTopProducts: () => Promise<void>;
  fetchSports: () => Promise<void>;
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

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/products/top-rated");
      const data = await res.json();
      setTopProducts(Array.isArray(data) ? data : []);
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
