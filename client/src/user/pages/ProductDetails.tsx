import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Truck, RotateCcw, Shield } from "lucide-react";
import { showToast } from "../../shared/components/Toast";
import ProductGallery from "../components/ProductGallery";
import { useWishlist } from "../../shared/contexts/wishlistContext";
import { useCart } from "../../shared/contexts/cartContext";
import ReviewDropdown from "../components/ProductDetail/ReviewDropdown";
import PolicyDropdown from "../components/ProductDetail/PolicyDropdown";
import RelatedProduct from "../components/ProductDetail/RelatedProduct";

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
  const [wishlistVariantIds, setWishlistVariantIds] = useState<number[]>([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const navigate = useNavigate();
  const { refresh } = useWishlist();
  const { refresh: refreshCart } = useCart();

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const user_id = payload.user_id;
      fetch(`http://localhost:8080/api/wishlist/wishlist-items/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const ids = Array.isArray(data.items)
            ? data.items.map((item: any) => item.variant_id)
            : [];
          setWishlistVariantIds(ids);
        });
    } catch {}
  }, [id]);

  useEffect(() => {
    async function fetchReviews() {
      const res = await fetch(
        `http://localhost:8080/api/review/product/${product.product_id}`
      );
      const data = await res.json();
      setReviews(data.reviews || []);
      setAverageRating(data.average_rating || 0);
    }
    if (product?.product_id) fetchReviews();
  }, [product?.product_id]);

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
  const isBall = category.includes("bóng");
  const isGear = category.includes("phụ kiện") || category.includes("dụng cụ");

  // Lấy danh sách variants từ product (nếu có)
  const variants = product?.Variants || product?.variants || [];

  console.log("variants", variants);

  // Tìm variant theo lựa chọn
  const selectedVariant = (() => {
    if (isClothing) {
      return variants.find((v: any) => v.variant_size === selectedSize);
    }
    if (isShoe) {
      return variants.find(
        (v: any) =>
          v.variant_size === selectedSize &&
          v.variant_color?.toLowerCase() ===
            SHOE_COLORS[selectedColor].name.toLowerCase()
      );
    }
    if (isGear) {
      return variants.find(
        (v: any) =>
          v.variant_color?.toLowerCase() ===
          SHOE_COLORS[selectedColor].name.toLowerCase()
      );
    }
    if (isBall) {
      return variants[0];
    }
    return undefined;
  })();

  // Kiểm tra variant đã có trong wishlist chưa
  const isInWishlist =
    selectedVariant && wishlistVariantIds.includes(selectedVariant.variant_id);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    let variantToAdd = selectedVariant;

    // Bóng: luôn lấy variant đầu tiên
    if (isBall && variants.length > 0) {
      variantToAdd = variants[0];
    }

    // KHÔNG gán lại variantToAdd cho phụ kiện!

    // Áo/quần áo hoặc giày: phải chọn size (và màu nếu là giày)
    if (isClothing && !selectedSize) {
      setError("Vui lòng chọn kích cỡ!");
      return;
    }
    if (isShoe && (!selectedSize || !SHOE_COLORS[selectedColor])) {
      setError("Vui lòng chọn kích cỡ và màu!");
      return;
    }
    if (isGear && !SHOE_COLORS[selectedColor]) {
      setError("Vui lòng chọn màu!");
      return;
    }
    if (!variantToAdd) {
      setError("Không tìm thấy phiên bản sản phẩm phù hợp!");
      return;
    }

    if (isLoggedIn) {
      try {
        const res = await fetch("http://localhost:8080/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            variant_id: variantToAdd.variant_id,
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
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingIndex = cart.findIndex(
        (item: any) => item.variant_id === variantToAdd.variant_id
      );
      if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          id: selectedVariant.variant_id,
          product_id: product.product_id, // <-- thêm dòng này!
          variant_id: selectedVariant.variant_id,
          quantity: 1,
          name: product.product_name,
          price: product.product_price,
          image: product.product_image,
          size: selectedVariant.variant_size,
          color: selectedVariant.variant_color,
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      refreshCart(); // <-- Thêm dòng này để cập nhật số lượng trên header
      showToast("Thêm sản phẩm vào giỏ hàng thành công!", "success");
      navigate("/cart");
    }
  };

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Bạn cần đăng nhập để thêm vào yêu thích!", "error");
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    if (!selectedVariant) {
      showToast("Vui lòng chọn phân loại!", "error");
      return;
    }
    try {
      // Lấy wishlist_id của user
      const payload = JSON.parse(atob(token.split(".")[1]));
      const user_id = payload.user_id;
      const res = await fetch(`http://localhost:8080/api/wishlist/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const wishlist_id = data.wishlist_id;
      // Gọi API thêm vào wishlist
      const addRes = await fetch(
        `http://localhost:8080/api/wishlist/add/${wishlist_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            variant_id: selectedVariant.variant_id,
            added_at: new Date().toISOString(),
          }),
        }
      );
      const addData = await addRes.json();
      if (addData.success) {
        showToast("Đã thêm vào danh sách yêu thích!", "success");
        refresh(); // cập nhật context
        // Cập nhật lại danh sách variant_id đã có trong wishlist
        fetch(`http://localhost:8080/api/wishlist/wishlist-items/${user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            const ids = Array.isArray(data.items)
              ? data.items.map((item: any) => item.variant_id)
              : [];
            setWishlistVariantIds(ids);
          });
      } else {
        showToast(
          addData.message || "Đã có trong danh sách yêu thích!",
          "info"
        );
      }
    } catch {
      showToast("Thêm vào danh sách yêu thích thất bại!", "error");
    }
  };

  const isBallOutOfStock =
    isBall && variants.length > 0 && variants[0].variant_stock === 0;

  // Chuẩn bị mảng ảnh gallery
  const galleryImages =
    product.Product_Images?.map((img: any) => img.image_url) || [];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <ProductGallery
              images={galleryImages}
              mainImage={product.product_image}
            />
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
                  {(isClothing ? CLOTHING_SIZES : SHOE_SIZES).map((size) => {
                    // Tìm variant tương ứng với size (và màu nếu là giày)
                    const variant = isClothing
                      ? variants.find((v: any) => v.variant_size === size)
                      : variants.find(
                          (v: any) =>
                            v.variant_size === size &&
                            v.variant_color?.toLowerCase() ===
                              SHOE_COLORS[selectedColor].name.toLowerCase()
                        );
                    const outOfStock = !variant || variant.variant_stock === 0;
                    return (
                      <button
                        key={size}
                        onClick={() => !outOfStock && setSelectedSize(size)}
                        className={`py-3 text-center border-2 font-medium transition-colors ${
                          selectedSize === size
                            ? "border-black bg-black text-white"
                            : "border-gray-300 hover:border-gray-400"
                        } ${outOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={outOfStock}
                      >
                        {size}
                      </button>
                    );
                  })}
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

                {/* Giày: chọn size và màu mới hiển thị số lượng */}
                {isShoe && selectedSize && selectedVariant && (
                  <div className="mt-2 text-sm text-gray-600">
                    Số lượng còn lại:{" "}
                    <span className="font-semibold">
                      {selectedVariant.variant_stock}
                    </span>
                  </div>
                )}
              </div>
            )}
            {isBall && variants.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Số lượng còn lại:{" "}
                <span className="font-semibold">
                  {variants[0].variant_stock}
                </span>
              </div>
            )}
            {isGear && selectedVariant && (
              <div className="mt-2 text-sm text-gray-600">
                Số lượng còn lại:{" "}
                <span className="font-semibold">
                  {selectedVariant.variant_stock}
                </span>
              </div>
            )}
            {/* Hiển thị chọn màu cho giày và phụ kiện */}
            {(isShoe || isGear) && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Chọn màu</span>
                  <span className="text-sm text-gray-600">
                    {SHOE_COLORS[selectedColor].name}
                  </span>
                </div>
                <div className="flex space-x-3">
                  {SHOE_COLORS.map((color, index) => {
                    let variant;
                    if (isShoe) {
                      variant = variants.find(
                        (v: any) =>
                          v.variant_size === selectedSize &&
                          v.variant_color?.toLowerCase() ===
                            color.name.toLowerCase()
                      );
                    } else if (isGear) {
                      variant = variants.find(
                        (v: any) =>
                          v.variant_color?.toLowerCase() ===
                          color.name.toLowerCase()
                      );
                    }
                    const outOfStock = !variant || variant.variant_stock === 0;
                    return (
                      <button
                        key={color.name}
                        onClick={() => !outOfStock && setSelectedColor(index)}
                        className={`w-12 h-12 border-2 transition-colors ${
                          selectedColor === index
                            ? "border-black"
                            : "border-gray-300"
                        } ${outOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        disabled={outOfStock}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            {/* Không hiển thị size và màu nếu là phụ kiện hoặc dụng cụ */}
            <div className="flex space-x-4">
              {isBallOutOfStock ? (
                <button
                  className="flex-1 bg-gray-400 text-white py-4 font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ borderRadius: 0 }}
                  disabled
                >
                  <ShoppingBag className="w-5 h-5" />
                  Đã hết hàng
                </button>
              ) : (
                <button
                  className="flex-1 bg-black text-white py-4 font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                  style={{ borderRadius: 0 }}
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Thêm vào giỏ hàng
                </button>
              )}
              <button
                className={`w-14 h-14 border-2 ${
                  isInWishlist ? "border-black" : "border-gray-300"
                } flex items-center justify-center hover:border-gray-400 transition-colors`}
                style={{ borderRadius: 0 }}
                onClick={handleAddToWishlist}
                disabled={isInWishlist}
                title={
                  isInWishlist
                    ? "Đã có trong danh sách yêu thích"
                    : "Thêm vào danh sách yêu thích"
                }
              >
                <Heart
                  className="w-5 h-5"
                  color={isInWishlist ? "black" : "gray"}
                  fill={isInWishlist ? "black" : "none"}
                />
              </button>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

            <PolicyDropdown />
            <ReviewDropdown
              reviews={reviews}
              averageRating={product.average_rating || 0}
            />
          </div>
        </div>
        {/* Thêm sản phẩm nổi bật bên dưới */}
        <FeaturedProduct />
        <RelatedProduct productId={product.product_id} />
      </div>
    </div>
  );
}
