import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Truck, RotateCcw, Shield } from "lucide-react";
import { showToast } from "../components/Toast";

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

// Danh sách size cho áo đấu
const CLOTHING_SIZES = ["M", "L", "XL"];
const SHOE_SIZES = ["40", "41", "42"];
// Danh sách màu cho giày
const SHOE_COLORS = [
  { name: "Đen", hex: "#222" },
  { name: "Trắng", hex: "#fff" },
  { name: "Đỏ", hex: "#dc2626" },
];

// FeaturedProduct component
function FeaturedProduct() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch(
          "http://localhost:8080/api/products/top?limit=4"
        );
        const data = await res.json();
        setProducts(data.products || []);
      } catch {
        setProducts([]);
      }
    }
    fetchFeatured();
  }, []);

  if (!products.length) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Sản phẩm nổi bật
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.product_id}
            className="bg-white shadow hover:shadow-lg transition p-4 flex flex-col items-center cursor-pointer"
            onClick={() => (window.location.href = `/product/${p.product_id}`)}
          >
            <img
              src={p.product_image}
              alt={p.product_name}
              className="w-24 h-24 object-contain mb-3"
            />
            <div className="font-semibold text-gray-900 text-center">
              {p.product_name}
            </div>
            <div className="text-black font-bold mt-1">
              {formatVND(p.product_price)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState(""); // Thêm state cho lỗi
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`http://localhost:8080/api/products/${id}`);
        const data = await res.json();
        setProduct(data.product || data);
      } catch (err) {
        setProduct(null);
      }
    }
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Đang tải sản phẩm...</span>
      </div>
    );
  }

  // Xác định loại sản phẩm dựa vào category hoặc tên sản phẩm
  const category = (
    product.Category?.category_name ||
    product.category ||
    ""
  ).toLowerCase();

  const isClothing = category.includes("áo") || category.includes("quần áo");
  const isShoe = category.includes("giày");
  const isAccessory =
    category.includes("phụ kiện") || category.includes("dụng cụ");

  // Lấy danh sách variants từ product (nếu có)
  const variants = product?.Variants || product?.variants || [];

  console.log("variants", variants);

  // Tìm variant theo kích cỡ đã chọn (cho áo đấu hoặc giày)
  const selectedVariant = variants.find(
    (v: any) =>
      v.variant_size === selectedSize &&
      (!isShoe || v.variant_color === SHOE_COLORS[selectedColor].name)
  );

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    // Kiểm tra đã chọn size (và màu nếu là giày)
    if (!selectedSize || (isShoe && !SHOE_COLORS[selectedColor])) {
      setError("Vui lòng chọn size và màu (nếu có)!");
      return;
    }

    // Tìm đúng variant
    const selectedVariant = variants.find(
      (v: any) =>
        v.variant_size === selectedSize &&
        (!isShoe || v.variant_color === SHOE_COLORS[selectedColor].name)
    );
    if (!selectedVariant) {
      setError("Không tìm thấy phiên bản sản phẩm phù hợp!");
      return;
    }

    if (isLoggedIn) {
      // Gọi API thêm vào giỏ hàng trên server
      try {
        const res = await fetch("http://localhost:8080/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            variant_id: selectedVariant.variant_id,
            quantity: 1,
          }),
        });
        if (!res.ok) throw new Error("Thêm vào giỏ hàng thất bại!");
        showToast("Thêm sản phẩm vào giỏ hàng thành công!", "success");
        navigate("/cart");
      } catch (err) {
        setError("Thêm vào giỏ hàng thất bại!");
        showToast("Thêm vào giỏ hàng thất bại!", "error");
      }
    } else {
      // Lưu vào localStorage theo variant_id
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingIndex = cart.findIndex(
        (item: any) => item.variant_id === selectedVariant.variant_id
      );
      if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          variant_id: selectedVariant.variant_id,
          quantity: 1,
          name: product.product_name,
          price: selectedVariant.variant_price || product.product_price,
          image: product.product_image,
          size: selectedVariant.variant_size,
          color: selectedVariant.variant_color,
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      showToast("Thêm sản phẩm vào giỏ hàng thành công!", "success");
      navigate("/cart");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="bg-gray-100 aspect-square overflow-hidden">
              <img
                src={product.product_image || product.images?.[selectedImage]}
                alt={product.product_name || product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`bg-gray-100 aspect-square overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-black"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Xem ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 uppercase tracking-wider mb-2">
                {product.Category?.category_name || product.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {product.product_name || product.name}
              </h1>
              <div className="flex items-center space-x-3">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-bold">
                      {formatVND(product.discountPrice)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {formatVND(product.price)}
                    </span>
                    <span className="bg-black text-white text-sm font-semibold px-3 py-1">
                      Tiết kiệm{" "}
                      {formatVND(product.price - product.discountPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">
                    {formatVND(product.product_price || product.price)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {product.product_description || product.description}
            </p>
            {/* Hiển thị chọn kích cỡ nếu là áo đấu hoặc giày */}
            {(isClothing || isShoe) && (
              <div>
                <span className="font-semibold block mb-3">Chọn kích cỡ</span>
                <div className="grid grid-cols-3 gap-3">
                  {(isClothing ? CLOTHING_SIZES : SHOE_SIZES).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-center border-2 font-medium transition-colors ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {/* Hiển thị tồn kho nếu đã chọn size và có variant */}
                {isClothing && selectedSize && selectedVariant && (
                  <div className="mt-2 text-sm text-gray-600">
                    Số lượng còn lại:{" "}
                    <span className="font-semibold">
                      {selectedVariant.variant_stock}
                    </span>
                  </div>
                )}
                {isShoe &&
                  selectedSize &&
                  SHOE_COLORS[selectedColor] &&
                  selectedVariant && (
                    <div className="mt-2 text-sm text-gray-600">
                      Số lượng còn lại:{" "}
                      <span className="font-semibold">
                        {selectedVariant.variant_stock}
                      </span>
                    </div>
                  )}
              </div>
            )}
            {/* Hiển thị chọn màu nếu là giày */}
            {isShoe && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Chọn màu</span>
                  <span className="text-sm text-gray-600">
                    {SHOE_COLORS[selectedColor].name}
                  </span>
                </div>
                <div className="flex space-x-3">
                  {SHOE_COLORS.map((color, index) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(index)}
                      className={`w-12 h-12 border-2 transition-colors ${
                        selectedColor === index
                          ? "border-black"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Không hiển thị size và màu nếu là phụ kiện hoặc dụng cụ */}
            <div className="flex space-x-4">
              <button
                className="flex-1 bg-black text-white py-4 font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                style={{ borderRadius: 0 }}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-5 h-5" />
                Thêm vào giỏ hàng
              </button>
              <button
                className="w-14 h-14 border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                style={{ borderRadius: 0 }}
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Tính năng</h3>
              <ul className="space-y-2">
                {(product.features || []).map(
                  (feature: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-black rounded-full mt-2" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-start space-x-4">
                <Truck className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Miễn phí vận chuyển</h4>
                  <p className="text-sm text-gray-600">
                    Miễn phí vận chuyển cho đơn hàng trên 2.000.000 đ
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <RotateCcw className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Đổi trả dễ dàng</h4>
                  <p className="text-sm text-gray-600">
                    Đổi trả trong 60 ngày với sản phẩm chưa sử dụng
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Shield className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Bảo hành 2 năm</h4>
                  <p className="text-sm text-gray-600">
                    Bảo hành chính hãng 2 năm cho mọi sản phẩm
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Thêm sản phẩm nổi bật bên dưới */}
        <FeaturedProduct />
      </div>
    </div>
  );
}
