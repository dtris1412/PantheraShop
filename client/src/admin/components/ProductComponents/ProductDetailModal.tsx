import { useState, useEffect } from "react";
import { X, Edit, Trash2, Star, Package, Tag } from "lucide-react";
import { useProduct } from "../../contexts/productContext";
import { showToast } from "../../../shared/components/Toast";
const apiUrl = import.meta.env.VITE_API_URL;
interface Product {
  product_id: number;
  product_name: string;
  product_description: string | null;
  product_price: number | string;
  product_image: string | null;
  category_id: number;
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
  Variants?: ProductVariant[];
}

interface ProductVariant {
  variant_id: number;
  variant_size: string;
  variant_color: string;
  variant_stock: number;
}

interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  created_at: string;
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
  const { getProductById } = useProduct();
  const [detailedProduct, setDetailedProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);

  // Update currentProductId khi product thay đổi
  useEffect(() => {
    if (isOpen && product) {
      setCurrentProductId(product.product_id);
    } else if (!isOpen) {
      setCurrentProductId(null);
      setProductImages([]); // Reset images khi đóng modal
    }
  }, [isOpen, product]);

  // Fetch full product details - CHỈ khi currentProductId thay đổi
  useEffect(() => {
    if (!currentProductId) {
      setDetailedProduct(null);
      setVariants([]);
      return;
    }

    let isCancelled = false;

    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const fullProduct = await getProductById(currentProductId);

        if (!isCancelled && fullProduct) {
          setDetailedProduct(fullProduct);
          setVariants((fullProduct as any).Variants || []);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error fetching product details:", error);
          showToast("Không thể tải chi tiết sản phẩm", "error");
          if (product) {
            setDetailedProduct(product);
          }
          setVariants([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchProductDetails();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProductId]);

  // Fetch product images - CHỈ khi currentProductId thay đổi
  useEffect(() => {
    if (!currentProductId) {
      setProductImages([]);
      return;
    }

    let isCancelled = false;

    const fetchProductImages = async () => {
      setLoadingImages(true);
      console.log(`🔍 Fetching images for product ${currentProductId}...`);

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${apiUrl}/admin/product-images/${currentProductId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(`📡 Response status:`, res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.log(`❌ Error response:`, errorText);
          throw new Error("Failed to fetch product images");
        }

        const response = await res.json();
        console.log(`📦 API Response:`, response);

        if (!isCancelled) {
          // API trả về { success: true, data: [...] }
          let images = [];

          if (response.success && response.data) {
            images = response.data;
          } else if (response.images) {
            images = response.images;
          } else if (Array.isArray(response)) {
            images = response;
          }

          setProductImages(Array.isArray(images) ? images : []);
          console.log(
            `✅ Loaded ${images.length} images for product ${currentProductId}`
          );
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("❌ Error fetching product images:", error);
          // Không hiển thị toast error vì ảnh minh họa không bắt buộc
          setProductImages([]);
        }
      } finally {
        if (!isCancelled) {
          setLoadingImages(false);
        }
      }
    };

    fetchProductImages();

    return () => {
      isCancelled = true;
    };
  }, [currentProductId]);

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
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

  const displayProduct = detailedProduct || product;
  const stockStatus = getStockStatus(displayProduct.stock);

  // Tạo danh sách ảnh hiển thị: ảnh chính + ảnh phụ từ API
  const allImages: ProductImage[] = [];

  // Thêm ảnh chính (product_image) vào đầu nếu có
  if (displayProduct.product_image) {
    allImages.push({
      image_id: 0,
      product_id: displayProduct.product_id,
      image_url: displayProduct.product_image,
      is_primary: true,
      created_at: displayProduct.created_at,
    });
  }

  // Thêm các ảnh phụ từ API
  productImages.forEach((img) => {
    // Tránh trùng lặp nếu API trả về cả ảnh chính
    if (img.image_url !== displayProduct.product_image) {
      allImages.push(img);
    }
  });

  console.log(`🖼️ Total images to display:`, allImages.length);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Nike-style Header - Minimal and Clean */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
          <h2 className="text-sm uppercase tracking-wider font-medium">
            CHI TIẾT SẢN PHẨM
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Chỉnh sửa"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Xóa"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Đang tải...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Nike-style Content Layout */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Left: Image */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {displayProduct.product_image ? (
                      <img
                        src={displayProduct.product_image}
                        alt={displayProduct.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300">
                        <Package size={80} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Product Info */}
                <div className="space-y-6">
                  {/* Title & Price */}
                  <div>
                    <h1 className="text-3xl font-medium mb-2">
                      {displayProduct.product_name}
                    </h1>
                    <div className="text-xl font-medium">
                      {formatPrice(displayProduct.product_price)}
                    </div>
                  </div>

                  {/* Rating */}
                  {displayProduct.average_rating > 0 && (
                    <div className="flex items-center gap-2 pb-6 border-b">
                      <div className="flex items-center gap-1">
                        {renderStars(displayProduct.average_rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({displayProduct.average_rating.toFixed(1)})
                      </span>
                    </div>
                  )}

                  {/* Category & Team Info */}
                  <div className="space-y-3 pb-6 border-b">
                    {displayProduct.Category && (
                      <div>
                        <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                          DANH MỤC
                        </div>
                        <div className="font-medium">
                          {displayProduct.Category.category_name}
                        </div>
                      </div>
                    )}

                    {displayProduct.Team && (
                      <>
                        <div>
                          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                            ĐỘI/CLB
                          </div>
                          <div className="font-medium">
                            {displayProduct.Team.team_name}
                          </div>
                        </div>
                        {displayProduct.Team.Tournament && (
                          <>
                            <div>
                              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                                GIẢI ĐẤU
                              </div>
                              <div className="font-medium">
                                {displayProduct.Team.Tournament.tournament_name}
                              </div>
                            </div>
                            {displayProduct.Team.Tournament.Sport && (
                              <div>
                                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                                  MÔN THỂ THAO
                                </div>
                                <div className="font-medium">
                                  {
                                    displayProduct.Team.Tournament.Sport
                                      .sport_name
                                  }
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="text-xs uppercase tracking-wider text-gray-500">
                      TRẠNG THÁI
                    </div>
                    <span
                      className={`px-3 py-1 text-xs uppercase tracking-wider font-medium ${stockStatus.color}`}
                    >
                      {stockStatus.label}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({displayProduct.stock} sản phẩm)
                    </span>
                  </div>

                  {/* Description */}
                  {displayProduct.product_description && (
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                        MÔ TẢ
                      </div>
                      <p className="text-sm leading-relaxed text-gray-700">
                        {displayProduct.product_description}
                      </p>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="text-xs text-gray-400 pt-4">
                    Ngày tạo: {formatDate(displayProduct.created_at)}
                  </div>
                </div>
              </div>

              {/* Variants & Images Section - Compact Design */}
              <div className="px-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Variants Section - Compact */}
                  {variants.length > 0 && (
                    <div className="border-t pt-6">
                      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 flex items-center justify-between">
                        <span>BIẾN THỂ ({variants.length})</span>
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {variants.map((variant, index) => {
                          const variantStockStatus = getStockStatus(
                            variant.variant_stock
                          );
                          return (
                            <div
                              key={variant.variant_id || index}
                              className="border border-gray-200 p-3 hover:border-black transition-colors"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <span className="text-xs font-medium text-gray-400 flex-shrink-0">
                                    #{index + 1}
                                  </span>
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-sm font-medium truncate">
                                      {variant.variant_size}
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-sm text-gray-600 truncate">
                                      {variant.variant_color}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span
                                    className={`px-2 py-0.5 text-xs font-medium ${variantStockStatus.color} whitespace-nowrap`}
                                  >
                                    {variant.variant_stock}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Product Images Section - Compact with API Integration */}
                  <div className="border-t pt-6">
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 flex items-center justify-between">
                      <span>HÌNH ẢNH ({allImages.length})</span>
                      {loadingImages && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                          Đang tải...
                        </span>
                      )}
                    </h3>
                    {allImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                        {allImages.map((img, index) => (
                          <div
                            key={img.image_id || index}
                            className="aspect-square border border-gray-200 overflow-hidden group relative"
                          >
                            <img
                              src={img.image_url}
                              alt={`${displayProduct.product_name} - ${
                                index + 1
                              }`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {img.is_primary && (
                              <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-0.5 uppercase tracking-wider">
                                Chính
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-gray-300 p-8 flex flex-col items-center justify-center text-gray-400">
                        <Package size={32} strokeWidth={1} className="mb-2" />
                        <p className="text-xs">
                          {loadingImages
                            ? "Đang tải ảnh..."
                            : "Chưa có ảnh minh họa"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetailModal;
