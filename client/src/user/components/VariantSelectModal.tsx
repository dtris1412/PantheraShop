import { useEffect, useState } from "react";
import { X } from "lucide-react";
const apiUrl = import.meta.env.VITE_API_URL;
interface VariantOption {
  variant_id: number;
  variant_size: string | null;
  variant_color: string | null;
  variant_stock: number;
}

interface VariantSelectModalProps {
  productId: number;
  currentSize?: string;
  currentColor?: string;
  onClose: () => void;
  onUpdate: (variant: VariantOption) => void;
}

const ACCESSORY_SIZES = ["M", "L", "XL"];

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
  const [selectedSize, setSelectedSize] = useState(currentSize || "");
  const [selectedColor, setSelectedColor] = useState(currentColor || "");
  const [selectedVariant, setSelectedVariant] = useState<VariantOption | null>(
    null
  );

  useEffect(() => {
    setLoading(true);
    // Lấy thông tin sản phẩm
    fetch(`${apiUrl}/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const prod = data.product ? data.product : data;
        setProduct(prod);
        // Sau khi có product, lấy variants
        fetch(`${apiUrl}/variants/product/${productId}`)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then((variantData) => {
            // Sửa ở đây: lấy đúng mảng variants
            setVariants(
              Array.isArray(variantData.variants) ? variantData.variants : []
            );
            setLoading(false);
          })
          .catch((err) => {
            console.error("Lỗi khi fetch variants:", err);
            setVariants([]);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error("Lỗi khi fetch sản phẩm:", err);
        setProduct(null);
        setVariants([]);
        setLoading(false);
      });
  }, [productId]);

  // Xác định loại sản phẩm
  const categoryName = product?.Category?.category_name?.toLowerCase() || "";
  console.log("categoryName:", categoryName);
  const isJersey = categoryName.includes("áo đấu");
  const isShoe = categoryName.includes("giày");
  const isBall = categoryName.includes("bóng");
  const isAccessory = categoryName.includes("phụ kiện");

  // Lấy danh sách size và màu duy nhất
  let sizes: string[] = [];
  let colors: string[] = [];

  if (isAccessory) {
    sizes = ACCESSORY_SIZES;
  } else if (isJersey || isShoe) {
    sizes = [
      ...new Set(
        variants.map((v) => v.variant_size).filter((s): s is string => !!s)
      ),
    ];
  }

  if (isShoe) {
    colors = [
      ...new Set(
        variants.map((v) => v.variant_color).filter((c): c is string => !!c)
      ),
    ];
  }

  console.log("sizes:", sizes);
  console.log("colors:", colors);
  console.log("variants:", variants);

  // Tìm variant phù hợp
  useEffect(() => {
    let found: VariantOption | undefined;
    if (isJersey || isAccessory) {
      found = variants.find((v) => v.variant_size === selectedSize);
    } else if (isShoe) {
      found = variants.find(
        (v) =>
          v.variant_size === selectedSize && v.variant_color === selectedColor
      );
    } else if (isBall) {
      found = variants[0];
    }
    setSelectedVariant(found || null);
  }, [
    selectedSize,
    selectedColor,
    variants,
    isJersey,
    isShoe,
    isAccessory,
    isBall,
  ]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-2xl p-12 text-xl font-semibold">
          Đang tải dữ liệu sản phẩm...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-2xl p-12 text-xl font-semibold text-red-600">
          Không thể tải dữ liệu sản phẩm. Vui lòng thử lại!
        </div>
      </div>
    );
  }

  // if (!loading && product) {
  //   return (
  //     <div>
  //       <pre>{JSON.stringify(product, null, 2)}</pre>
  //     </div>
  //   );
  // }

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
          {/* Chọn size cho áo đấu, giày, phụ kiện */}
          {(isJersey || isShoe || isAccessory) && (
            <div className="mb-6">
              <div className="mb-2 font-semibold text-base">Chọn kích cỡ</div>
              <div className="grid grid-cols-3 gap-3">
                {sizes.map((size) => {
                  let outOfStock = false;
                  if (isJersey || isAccessory) {
                    outOfStock = !variants.find(
                      (v) => v.variant_size === size && v.variant_stock > 0
                    );
                  } else if (isShoe) {
                    outOfStock = !variants.find(
                      (v) =>
                        v.variant_size === size &&
                        v.variant_color === selectedColor &&
                        v.variant_stock > 0
                    );
                  }
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
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
          {/* Chọn màu cho giày */}
          {isShoe && (
            <div className="mb-6">
              <div className="mb-2 font-semibold text-base">Chọn màu</div>
              <div className="flex gap-3">
                {colors.map((color) => {
                  const outOfStock = !variants.find(
                    (v) =>
                      v.variant_color === color &&
                      v.variant_size === selectedSize &&
                      v.variant_stock > 0
                  );
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
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
              <span className="font-semibold">
                {selectedVariant.variant_stock}
              </span>
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
              onClick={() => selectedVariant && onUpdate(selectedVariant)}
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
