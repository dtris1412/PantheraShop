import { useState, useEffect } from "react";
import { X, Edit, Trash2, Star, Package, Tag } from "lucide-react";

interface Product {
  product_id: number;
  product_name: string;
  product_description?: string;
  product_price: string;
  product_image?: string;
  created_at: string;
  stock: number;
  average_rating: number;
  Category?: {
    category_id: number;
    category_name: string;
  };
  Team?: {
    team_id: number;
    team_name: string;
    Tournament?: {
      tournament_id: number;
      tournament_name: string;
      Sport?: {
        sport_id: number;
        sport_name: string;
      };
    };
  };
}

interface ProductVariant {
  variant_id: number;
  variant_size: string;
  variant_color: string;
  variant_stock: number;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductDetailModal = ({
  isOpen,
  product,
  onClose,
  onEdit,
  onDelete,
}: ProductDetailModalProps) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [activeTab, setActiveTab] = useState<"info" | "variants" | "images">(
    "info"
  );

  // Mock variants data
  useEffect(() => {
    if (product && isOpen) {
      // TODO: Fetch real variants from API
      setVariants([
        {
          variant_id: 1,
          variant_size: "M",
          variant_color: "Xanh",
          variant_stock: 10,
        },
        {
          variant_id: 2,
          variant_size: "L",
          variant_color: "Xanh",
          variant_stock: 15,
        },
        {
          variant_id: 3,
          variant_size: "XL",
          variant_color: "Đỏ",
          variant_stock: 5,
        },
      ]);
    }
  }, [product, isOpen]);

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { label: "Hết hàng", color: "bg-red-100 text-red-800" };
    } else if (stock < 20) {
      return { label: "Sắp hết", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "Còn hàng", color: "bg-green-100 text-green-800" };
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }
      />
    ));
  };

  if (!isOpen || !product) return null;

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Package className="text-gray-600" size={24} />
            <h2 className="text-xl font-semibold">Chi tiết sản phẩm</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Chỉnh sửa"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Xóa"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Product Image */}
          <div className="lg:w-1/2 p-6">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.product_image ? (
                <img
                  src={product.product_image}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Package size={64} />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 p-6">
            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {product.product_name}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(product.product_price)}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${stockStatus.color}`}
                  >
                    {stockStatus.label}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(product.average_rating)}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.average_rating.toFixed(1)})
                </span>
              </div>

              {/* Category & Team */}
              <div className="space-y-2">
                {product.Category && (
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-gray-500" />
                    <span className="text-sm">
                      <span className="font-medium">Danh mục:</span>{" "}
                      {product.Category.category_name}
                    </span>
                  </div>
                )}

                {product.Team && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        <span className="font-medium">Đội:</span>{" "}
                        {product.Team.team_name}
                      </span>
                    </div>
                    {product.Team.Tournament && (
                      <>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">Giải đấu:</span>{" "}
                            {product.Team.Tournament.tournament_name}
                          </span>
                        </div>
                        {product.Team.Tournament.Sport && (
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">Môn thể thao:</span>{" "}
                              {product.Team.Tournament.Sport.sport_name}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Stock Info */}
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm">
                  <span className="font-medium">Tổng tồn kho:</span>{" "}
                  {product.stock} sản phẩm
                </div>
              </div>

              {/* Description */}
              {product.product_description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Mô tả</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.product_description}
                  </p>
                </div>
              )}

              {/* Created Date */}
              <div className="text-xs text-gray-500">
                Ngày tạo: {formatDate(product.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t">
          <div className="flex">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "info"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Thông tin chi tiết
            </button>
            <button
              onClick={() => setActiveTab("variants")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "variants"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Biến thể ({variants.length})
            </button>
            <button
              onClick={() => setActiveTab("images")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "images"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Hình ảnh
            </button>
          </div>

          <div className="p-6">
            {activeTab === "info" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID sản phẩm:</span> #
                    {product.product_id}
                  </div>
                  <div>
                    <span className="font-medium">Trạng thái:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded text-xs ${stockStatus.color}`}
                    >
                      {stockStatus.label}
                    </span>
                  </div>
                </div>

                {product.product_description && (
                  <div>
                    <h4 className="font-medium mb-2">Mô tả chi tiết</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {product.product_description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "variants" && (
              <div className="space-y-3">
                {variants.length > 0 ? (
                  variants.map((variant) => (
                    <div
                      key={variant.variant_id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="font-medium">Size:</span>{" "}
                          {variant.variant_size}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Màu:</span>{" "}
                          {variant.variant_color}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Tồn kho:</span>{" "}
                        {variant.variant_stock}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có biến thể nào
                  </div>
                )}
              </div>
            )}

            {activeTab === "images" && (
              <div className="text-center py-8 text-gray-500">
                Chức năng quản lý hình ảnh đang phát triển
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
