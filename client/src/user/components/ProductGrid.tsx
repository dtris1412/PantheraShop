import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";

export default function ProductGrid({
  products,
  onViewDetails,
}: {
  products: any[];
  onViewDetails: (id: string) => void;
}) {
  const navigate = useNavigate();

  if (products.length === 0)
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">
          No products found in this category.
        </p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.product_id}
          product={{
            id: product.product_id,
            name: product.product_name,
            price: Number(product.product_price),
            image: product.product_image,
            average_rating: product.average_rating,
            description: product.product_description,
            sport: product.Team?.Tournament?.Sport?.sport_name,
            is_active: product.is_active, // THÊM DÒNG NÀY
          }}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
