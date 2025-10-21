import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { showToast } from "../components/Toast";
import VariantSelectModal from "../components/VariantSelectModal"; // Import component ở đây
import { useNavigate } from "react-router-dom";
import { useOrder } from "../contexts/orderContext";

interface CartProps {
  onNavigate: (page: string) => void;
}

interface CartItem {
  id: string; // variant_id
  product_id: number; // <-- thêm dòng này
  name: string;
  price: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
}

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

export default function Cart({ onNavigate }: CartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null); // <--- Thêm state này
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState("");
  const navigate = useNavigate();
  const { setOrderItems } = useOrder();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      let user_id = "";
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        user_id = payload.user_id;
      } catch {
        setIsLoggedIn(false);
      }

      if (user_id) {
        fetch(`http://localhost:8080/api/cart/${user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((cartData) => {
            if (!cartData.cart_id) {
              setCartItems([]);
              setCartId(null);
              return;
            }
            setCartId(cartData.cart_id);
            fetch(`http://localhost:8080/api/cart/items/${cartData.cart_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .then((items) => {
                const normalized = Array.isArray(items)
                  ? items.map((item: any) => ({
                      id: item.variant_id,
                      product_id: item.Variant?.product_id, // <-- thêm dòng này
                      name: item.Variant?.Product?.product_name || "",
                      price: Number(item.Variant?.Product?.product_price) || 0,
                      image: item.Variant?.Product?.product_image || "",
                      size: item.Variant?.variant_size || "",
                      color: item.Variant?.variant_color || "",
                      quantity: item.quantity,
                    }))
                  : [];
                setCartItems(normalized);
              })
              .catch(() => setCartItems([]));
          })
          .catch(() => setCartItems([]));
      }
    } else {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(cart);
    }
  }, []);

  // Sửa hàm updateQuantity:
  const updateQuantity = async (id: string, change: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      setConfirmRemoveId(id); // Hiện dialog xác nhận xóa
      return;
    }

    if (isLoggedIn && cartId) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:8080/api/cart/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cart_id: cartId,
            variant_id: id,
            quantity: newQuantity,
          }),
        });
        if (!res.ok) throw new Error("Cập nhật thất bại");
        const itemsRes = await fetch(
          `http://localhost:8080/api/cart/items/${cartId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const items = await itemsRes.json();
        const normalized = Array.isArray(items)
          ? items.map((item: any) => ({
              id: item.variant_id,
              product_id: item.Variant?.product_id, // <-- add product_id here
              name: item.Variant?.Product?.product_name || "",
              price: Number(item.Variant?.Product?.product_price) || 0,
              image: item.Variant?.Product?.product_image || "",
              size: item.Variant?.variant_size || "",
              color: item.Variant?.variant_color || "",
              quantity: item.quantity,
            }))
          : [];
        setCartItems(normalized);
      } catch (err) {
        showToast("Cập nhật số lượng thất bại!", "error");
      }
    } else {
      setCartItems((items) => {
        const newItems = items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        );
        localStorage.setItem("cart", JSON.stringify(newItems));
        return newItems;
      });
    }
  };

  const removeItem = async (id: string) => {
    if (isLoggedIn && cartId) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `http://localhost:8080/api/cart/remove/${cartId}/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Xóa thất bại");
        const itemsRes = await fetch(
          `http://localhost:8080/api/cart/items/${cartId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const items = await itemsRes.json();
        const normalized = Array.isArray(items)
          ? items.map((item: any) => ({
              id: item.variant_id,
              product_id: item.Variant?.product_id,
              name: item.Variant?.Product?.product_name || "",
              price: Number(item.Variant?.Product?.product_price) || 0,
              image: item.Variant?.Product?.product_image || "",
              size: item.Variant?.variant_size || "",
              color: item.Variant?.variant_color || "",
              quantity: item.quantity,
            }))
          : [];
        setCartItems(normalized);
        showToast("Đã xóa sản phẩm thành công!", "success");
      } catch (err) {
        showToast("Xóa sản phẩm thất bại!", "error");
      }
    } else {
      setCartItems((items) => {
        const newItems = items.filter((item) => String(item.id) !== String(id));
        // Cập nhật localStorage sau khi đã lọc xong
        localStorage.setItem("cart", JSON.stringify(newItems));
        showToast("Đã xóa sản phẩm thành công!", "success");
        return newItems;
      });
    }
  };

  const handleChangeVariant = async (
    id: string,
    variantId: string,
    quantity: number,
    size: string,
    color: string
  ) => {
    if (isLoggedIn && cartId) {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:8080/api/cart/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cart_id: cartId,
            variant_id: variantId,
            quantity,
          }),
        });
        if (!res.ok) throw new Error("Cập nhật thất bại");
        const itemsRes = await fetch(
          `http://localhost:8080/api/cart/items/${cartId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const items = await itemsRes.json();
        const normalized = Array.isArray(items)
          ? items.map((item: any) => ({
              id: item.variant_id,
              product_id: item.Variant?.product_id, // <-- add this line
              name: item.Variant?.Product?.product_name || "",
              price: Number(item.Variant?.Product?.product_price) || 0,
              image: item.Variant?.Product?.product_image || "",
              size: item.Variant?.variant_size || "",
              color: item.Variant?.variant_color || "",
              quantity: item.quantity,
            }))
          : [];
        setCartItems(normalized);
        showToast("Đã cập nhật sản phẩm thành công!", "success");
      } catch (err) {
        showToast("Cập nhật sản phẩm thất bại!", "error");
      }
    } else {
      setCartItems((items) => {
        const newItems = items.map((item) =>
          item.id === id ? { ...item, id: variantId, size, color } : item
        );
        localStorage.setItem("cart", JSON.stringify(newItems));
        return newItems;
      });
    }
  };

  // Hàm đổi variant trong giỏ hàng
  const updateCartVariant = async (variant: {
    variant_id: string | number;
    variant_size?: string;
    variant_color?: string;
  }) => {
    if (!editingItem) return;
    if (isLoggedIn && cartId) {
      const token = localStorage.getItem("token");
      try {
        // Gọi API đổi variant (cần backend hỗ trợ endpoint này, ví dụ: /api/cart/change-variant)
        const res = await fetch(
          `http://localhost:8080/api/cart/change-variant`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              cart_id: cartId,
              old_variant_id: editingItem.id,
              new_variant_id: variant.variant_id,
              quantity: editingItem.quantity,
            }),
          }
        );
        if (!res.ok) throw new Error("Cập nhật thất bại");
        // Lấy lại cart mới
        const itemsRes = await fetch(
          `http://localhost:8080/api/cart/items/${cartId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const items = await itemsRes.json();
        const normalized = Array.isArray(items)
          ? items.map((item: any) => ({
              id: item.variant_id,
              product_id: item.Variant?.product_id,
              name: item.Variant?.Product?.product_name || "",
              price: Number(item.Variant?.Product?.product_price) || 0,
              image: item.Variant?.Product?.product_image || "",
              size: item.Variant?.variant_size || "",
              color: item.Variant?.variant_color || "",
              quantity: item.quantity,
            }))
          : [];
        setCartItems(normalized);
        showToast("Đã cập nhật sản phẩm thành công!", "success");
      } catch (err) {
        showToast("Cập nhật sản phẩm thất bại!", "error");
      }
    } else {
      // Guest: đổi variant trong localStorage
      setCartItems((items) => {
        const newItems = items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                id: String(variant.variant_id),
                size: variant.variant_size || "",
                color: variant.variant_color || "",
              }
            : item
        );
        localStorage.setItem("cart", JSON.stringify(newItems));
        return newItems;
      });
      showToast("Đã cập nhật sản phẩm thành công!", "success");
    }
    setEditingItem(null);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 1500000 ? 0 : 15000;
  const total = subtotal + shipping;

  const handleProceedOrder = async () => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8080/api/cart/items/${cartId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setOrderItems(data);
      navigate("/order-info");
    } else {
      // Guest: chỉ cần chuyển trang, dữ liệu đã nằm trong localStorage
      const guestCart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (guestCart.length === 0) return;
      navigate("/order-info");
    }
  };

  const handleApplyVoucher = () => {
    // Demo: mã "SALE50" giảm 50k, "SALE10P" giảm 10%
    if (voucherCode === "SALE50") {
      setVoucherDiscount(50000);
      setVoucherError("");
    } else if (voucherCode === "SALE10P") {
      setVoucherDiscount(Math.floor(subtotal * 0.1));
      setVoucherError("");
    } else if (voucherCode.trim() === "") {
      setVoucherDiscount(0);
      setVoucherError("");
    } else {
      setVoucherDiscount(0);
      setVoucherError("Mã voucher không hợp lệ!");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Giỏ hàng</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-6">
              Giỏ hàng của bạn đang trống
            </p>
            <button
              onClick={() => onNavigate("products")}
              className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 bg-white border border-gray-200 p-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover bg-gray-100"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Kích cỡ: {item.size} | Màu: {item.color}
                    </p>
                    <p className="font-semibold">{formatVND(item.price)}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-gray-500" />
                  </button>

                  <button
                    className="ml-2 px-3 py-1 border border-black rounded text-sm hover:bg-gray-100 transition"
                    onClick={() => setEditingItem(item)}
                  >
                    Đổi size/màu
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">{formatVND(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Miễn phí" : formatVND(shipping)}
                    </span>
                  </div>
                  {/* Input voucher chuyển xuống sau phí vận chuyển */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã giảm giá (voucher)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã voucher"
                        className="flex-1 border border-gray-300 rounded px-3 py-2"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                      />
                      <button
                        onClick={handleApplyVoucher}
                        className="px-4 py-2 bg-black text-white font-semibold rounded hover:bg-gray-900 transition"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {voucherError && (
                      <div className="text-red-500 text-sm mt-2">
                        {voucherError}
                      </div>
                    )}
                    {voucherDiscount > 0 && (
                      <div className="text-green-600 text-sm mt-2">
                        Đã áp dụng mã giảm giá: -{formatVND(voucherDiscount)}
                      </div>
                    )}
                  </div>
                  {subtotal < 1500000 && (
                    <div className="text-xs text-gray-600 pt-2 border-t border-gray-300">
                      Mua thêm {formatVND(1500000 - subtotal)} để được miễn phí
                      vận chuyển
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-lg font-bold mb-6 pt-4 border-t border-gray-300">
                  <span>Tổng cộng</span>
                  <span>{formatVND(total - voucherDiscount)}</span>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleProceedOrder}
                    className="w-full py-3 bg-black text-white font-semibold hover:bg-gray-900 transition"
                    style={{ borderRadius: 0 }}
                  >
                    Tiến hành đặt hàng
                  </button>
                  <button
                    onClick={() => onNavigate("products")}
                    className="w-full border-2 border-black text-black py-4 font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dialog xác nhận xóa */}
        {confirmRemoveId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white border border-black rounded-lg shadow-lg p-7 w-[340px] animate-fade-in">
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Trash2 className="w-6 h-6 text-black" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-black text-center">
                  Xác nhận xóa sản phẩm?
                </h3>
                <p className="text-gray-700 text-center mb-6">
                  Sản phẩm sẽ bị xóa khỏi giỏ hàng của bạn. Bạn chắc chắn muốn
                  tiếp tục?
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setConfirmRemoveId(null)}
                    className="flex-1 py-2 rounded-lg border border-black text-black font-semibold hover:bg-gray-100 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      removeItem(confirmRemoveId);
                      setConfirmRemoveId(null);
                    }}
                    className="flex-1 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-900 transition"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
            <style>
              {`
                .animate-fade-in {
                  animation: fadeInModal 0.18s cubic-bezier(.4,0,.2,1);
                }
                @keyframes fadeInModal {
                  from { opacity: 0; transform: translateY(24px);}
                  to { opacity: 1; transform: none;}
                }
              `}
            </style>
          </div>
        )}

        {editingItem && (
          <VariantSelectModal
            productId={editingItem.product_id} // <-- dùng product_id, không dùng id
            currentSize={editingItem.size}
            currentColor={editingItem.color}
            onClose={() => setEditingItem(null)}
            onUpdate={(variant) => {
              // Gọi API đổi variant ở đây
              updateCartVariant({
                ...variant,
                variant_size: variant.variant_size ?? "",
                variant_color: variant.variant_color ?? "",
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
