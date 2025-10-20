import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import OrderProductList from "../components/order_info/OrderProductList";
import OrderRecipientForm from "../components/order_info/OrderRecipientForm";
import OrderPaymentMethod from "../components/order_info/OrderPaymentMethod";
import { useOrder } from "../contexts/OrderContext";

interface CartItem {
  id: string;
  product_id: number;
  name: string;
  price: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
}

interface RecipientInfo {
  name: string;
  phone: string;
  address: string;
  note: string;
}

type PaymentMethod = "cod" | "momo" | "paypal";

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

export default function OrderInfo() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [recipient, setRecipient] = useState<RecipientInfo>({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const { orderItems } = useOrder();

  // Kiểm tra đăng nhập
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    if (isLoggedIn) {
      const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
      setRecipient((prev) => ({
        name: userInfo.user_name || prev.name,
        phone: userInfo.user_phone || prev.phone,
        address: userInfo.user_address || prev.address,
        note: "",
      }));
      // Đã đăng nhập: lấy từ context
      if (orderItems && orderItems.length > 0) {
        // Nếu dữ liệu từ API chưa đúng định dạng CartItem, chuyển đổi lại
        const mapped = orderItems.map((item: any) => ({
          id: String(item.variant_id ?? item.id),
          product_id: item.product_id ?? item.Variant?.product_id,
          name: item.name ?? item.Variant?.Product?.product_name,
          price: Number(item.price ?? item.Variant?.Product?.product_price),
          size: item.size ?? item.Variant?.variant_size,
          color: item.color ?? item.Variant?.variant_color,
          image: item.image ?? item.Variant?.Product?.product_image,
          quantity: item.quantity,
        }));
        setCartItems(mapped);
      }
    } else {
      // Guest: lấy lại dữ liệu từ localStorage mỗi khi vào trang
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(cart);
    }
  }, [isLoggedIn, orderItems]);

  const handleCancel = () => {
    setRecipient({ name: "", phone: "", address: "", note: "" });
    setPayment("cod");
    window.history.back();
  };

  const handleConfirm = () => {
    alert("Đặt hàng thành công!");
    if (!isLoggedIn) localStorage.removeItem("cart");
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const shipping = subtotal >= 1500000 ? 0 : 15000;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">Thông tin đơn hàng</h1>
        <OrderProductList items={cartItems} />

        <OrderRecipientForm value={recipient} onChange={setRecipient} />
        <OrderPaymentMethod value={payment} onChange={setPayment} />
        <div className="flex gap-4 mt-12">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 border border-black text-black font-semibold hover:bg-gray-100 transition"
            style={{ borderRadius: 8 }}
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 bg-black text-white font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2"
            style={{ borderRadius: 0 }}
          >
            Tiến hành đặt hàng
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
