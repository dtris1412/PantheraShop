import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface VariantOption {
  id: number | string;
  size?: string;
  color?: string;
  stock?: number;
}

interface VariantSelectModalProps {
  productId: number | string;
  currentSize?: string;
  currentColor?: string;
  onClose: () => void;
  onUpdate?: (variant: VariantOption) => void;
}

export default function VariantSelectModal({
  productId,
  currentSize,
  currentColor,
  onClose,
  onUpdate,
}: VariantSelectModalProps) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState(currentSize || "");
  const [selectedColor, setSelectedColor] = useState(currentColor || "");
  const [selectedVariant, setSelectedVariant] = useState<VariantOption | null>(
    null
  );

  // Fetch chi tiết sản phẩm khi mở modal
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8080/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        // Map variants
        const mappedVariants = (data.product.Variants || []).map((v: any) => ({
          id: v.variant_id,
          size: v.variant_size,
          color: v.variant_color,
          stock: v.variant_stock,
        }));
        setVariants(mappedVariants);
        // Lấy danh sách size, color duy nhất
        const sizes = [
          ...new Set(
            mappedVariants
              .map((v: VariantOption) => v.size as string)
              .filter(Boolean)
          ),
        ];
        const colors = [
          ...new Set(
            mappedVariants
              .map((v: VariantOption) => v.color as string)
              .filter(Boolean)
          ),
        ];
        setSizes([
          ...new Set(
            mappedVariants
              .map((v: VariantOption) => v.size as string)
              .filter(Boolean)
          ),
        ] as string[]);

        setColors([
          ...new Set(
            mappedVariants
              .map((v: VariantOption) => v.color as string)
              .filter(Boolean)
          ),
        ] as string[]);
        setLoading(false);
      });
  }, [productId]);

  // Tìm variant phù hợp khi chọn size/màu
  useEffect(() => {
    if (!variants.length) return;
    const found = variants.find(
      (v) =>
        (sizes.length > 0 ? v.size === selectedSize : true) &&
        (colors.length > 0 ? v.color === selectedColor : true)
    );
    setSelectedVariant(found || null);
  }, [selectedSize, selectedColor, variants, sizes, colors]);

  if (loading || !product) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-2xl p-12 text-xl font-semibold">
          Đang tải dữ liệu sản phẩm...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex overflow-hidden relative min-h-[520px]">
        {/* Ảnh sản phẩm */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-0 min-h-[520px]">
          <img
            src={product.product_image}
            alt={product.product_name}
            className="object-contain w-full h-full"
            style={{ maxHeight: 520 }}
          />
        </div>
        {/* Thông tin và chọn variant */}
        <div className="flex-1 p-12 flex flex-col min-w-[400px] relative">
          <button
            className="absolute top-6 right-6 text-gray-500 hover:text-black text-3xl"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X />
          </button>
          <h2 className="text-2xl font-bold mb-1">{product.product_name}</h2>
          <div className="text-gray-700 mb-6 text-lg font-semibold">
            {Number(product.product_price).toLocaleString("vi-VN")}₫
          </div>
          {/* Chọn size nếu có */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <div className="mb-2 font-semibold text-base">Chọn kích cỡ</div>
              <div className="grid grid-cols-3 gap-3">
                {sizes.map((size) => {
                  const variant = variants.find(
                    (v) =>
                      v.size === size &&
                      (colors.length > 0 ? v.color === selectedColor : true)
                  );
                  const outOfStock = !variant || variant.stock === 0;
                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      className={`py-3 rounded-md border text-base font-medium transition-colors ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-black bg-white"
                      } ${outOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={outOfStock}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Chọn màu nếu có */}
          {colors.length > 0 && (
            <div className="mb-6">
              <div className="mb-2 font-semibold text-base">Chọn màu</div>
              <div className="flex gap-3">
                {colors.map((color) => {
                  const variant = variants.find(
                    (v) =>
                      v.color === color &&
                      (sizes.length > 0 ? v.size === selectedSize : true)
                  );
                  const outOfStock = !variant || variant.stock === 0;
                  return (
                    <button
                      key={color}
                      onClick={() => !outOfStock && setSelectedColor(color)}
                      className={`px-6 py-3 rounded-md border text-base font-medium transition-colors ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-black bg-white"
                      } ${outOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={outOfStock}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Số lượng tồn kho */}
          {selectedVariant && (
            <div className="mb-6 text-gray-600 text-sm">
              Số lượng còn lại:{" "}
              <span className="font-semibold">{selectedVariant.stock}</span>
            </div>
          )}
          <div className="mt-auto flex flex-col gap-2">
            <button
              className={`w-full py-3 rounded-md font-semibold text-lg ${
                selectedVariant
                  ? "bg-black text-white hover:bg-gray-900"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!selectedVariant}
              onClick={() =>
                selectedVariant && onUpdate && onUpdate(selectedVariant)
              }
            >
              Cập nhật sản phẩm
            </button>
            <button
              className="w-full py-3 rounded-md border border-black text-black font-semibold hover:bg-gray-100"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
