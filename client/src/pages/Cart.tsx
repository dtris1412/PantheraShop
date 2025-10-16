import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { showToast } from "../components/Toast";

interface CartProps {
  onNavigate: (page: string) => void;
}

interface CartItem {
  id: string; // variant_id
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

  const updateQuantity = async (id: string, change: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + change);

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
        localStorage.setItem("cart", JSON.stringify(newItems));
        showToast("Đã xóa sản phẩm thành công!", "success");
        return newItems;
      });
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 1500000 ? 0 : 15000;
  const total = subtotal + shipping;

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

                  {subtotal < 1500000 && (
                    <div className="text-xs text-gray-600 pt-2 border-t border-gray-300">
                      Mua thêm {formatVND(1500000 - subtotal)} để được miễn phí
                      vận chuyển
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-lg font-bold mb-6 pt-4 border-t border-gray-300">
                  <span>Tổng cộng</span>
                  <span>{formatVND(total)}</span>
                </div>

                <button
                  onClick={() => onNavigate("checkout")}
                  className="w-full bg-black text-white py-4 font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 mb-3"
                >
                  <span>Tiến hành thanh toán</span>
                  <ArrowRight className="w-5 h-5" />
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
        )}
      </div>
    </div>
  );
}
