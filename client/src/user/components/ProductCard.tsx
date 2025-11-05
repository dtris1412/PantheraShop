import { Heart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  average_rating?: number;
  description?: string;
  sport?: string;
  is_active?: boolean | number; // Thêm trường này
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

  // Kiểm tra trạng thái bán
  const isInactive = product.is_active === false || product.is_active === 0;

  return (
    <div
      className={`group cursor-pointer relative ${
        isInactive ? "opacity-60 pointer-events-none" : ""
      }`}
      onClick={() => {
        if (!isInactive) onViewDetails(product.id);
      }}
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

        {/* Hiển thị chữ "Ngừng bán" nếu sản phẩm bị khóa */}
        {isInactive && (
          <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-base font-bold">
            Ngừng bán
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-xs text-gray-500">{product.sport}</div>
        <div className="font-medium text-base truncate">{product.name}</div>
        {product.average_rating !== undefined && (
          <div className="text-yellow-500 text-xs">
            ⭐ {Number(product.average_rating).toFixed(1)}
          </div>
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
