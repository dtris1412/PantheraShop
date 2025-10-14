import { Heart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  rating?: number;
  description?: string;
  sport?: string;
  // category: string;
  // isNew?: boolean;
  // colors?: number;
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (id: string) => void;
}

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

export default function ProductCard({
  product,
  onViewDetails,
}: ProductCardProps) {
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.price - product.discountPrice!) / product.price) * 100
      )
    : 0;

  return (
    <div
      className="group cursor-pointer"
      onClick={() => onViewDetails(product.id)}
    >
      <div className="relative bg-gray-100 mb-3 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-black text-white text-xs font-semibold px-3 py-1">
            -{discountPercent}%
          </span>
        )}

        <button
          className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 transform duration-200"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {/* sport name: chữ nhỏ, màu xám */}
        <div className="text-xs text-gray-500">{product.sport}</div>
        {/* Hiển thị tên sản phẩm */}
        <div className="font-medium text-base truncate">{product.name}</div>
        {/* Hiển thị rating nếu có */}
        {product.rating !== undefined && (
          <div className="text-yellow-500 text-xs">⭐ {product.rating}</div>
        )}
        <div className="flex items-center space-x-2 pt-1">
          {hasDiscount ? (
            <>
              <span className="font-semibold">
                {product.discountPrice !== undefined
                  ? formatVND(product.discountPrice)
                  : ""}
              </span>
              <span className="text-gray-500 line-through text-sm">
                {formatVND(product.price)}
              </span>
            </>
          ) : (
            <span className="font-semibold">{formatVND(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
