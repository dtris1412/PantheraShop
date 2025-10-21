import React, { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import OrderProductList from "../components/order_info/OrderProductList";
import OrderRecipientForm from "../components/order_info/OrderRecipientForm";
import OrderPaymentMethod from "../components/order_info/OrderPaymentMethod";
import PaymentComponent from "../components/order_info/PaymentComponent";
import { useOrder } from "../contexts/orderContext";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";

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
  email: string;
  address: string;
  note: string;
}

type PaymentMethod = "cod" | "momo" | "VnPay";

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

export default function OrderInfo() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [recipient, setRecipient] = useState<RecipientInfo>({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [showResult, setShowResult] = useState<null | "success" | "fail">(null);
  const [recipientError, setRecipientError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const { orderItems } = useOrder();
  const { user } = useAuth();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const userId = user?.user_id ? user.user_id.toString() : "guest";

  useEffect(() => {
    if (isLoggedIn) {
      const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
      setRecipient((prev) => ({
        name: userInfo.user_name || prev.name,
        phone: userInfo.user_phone || prev.phone,
        email: userInfo.user_email || prev.email,
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
    setRecipient({ name: "", phone: "", email: "", address: "", note: "" });
    setPayment("cod");
    window.history.back();
  };

  const handleConfirm = () => {
    if (
      !recipient.name ||
      !recipient.phone ||
      !recipient.email ||
      !recipient.address
    ) {
      setRecipientError("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }
    setRecipientError("");
    alert("Đặt hàng thành công!");
    if (!isLoggedIn) localStorage.removeItem("cart");
    const isSuccess = true; // hoặc lấy từ kết quả API
    setShowResult(isSuccess ? "success" : "fail");
    setTimeout(() => {
      setShowResult(null);
      navigate("/cart");
    }, 2000);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const shipping = subtotal >= 1500000 ? 0 : 15000;
  const total = subtotal + shipping;

  useEffect(() => {
    console.log("showPayment:", showPayment);
  }, [showPayment]);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        {showPayment ? (
          <PaymentComponent
            cartItems={cartItems}
            recipient={recipient}
            amount={total}
            onBack={() => setShowPayment(false)}
          />
        ) : (
          <>
            {/* Nút quay về, tiêu đề, grid layout... */}
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 mb-6 text-black font-semibold hover:underline"
            >
              Quay về
            </button>
            <h1 className="text-3xl font-bold mb-8">Thông tin đơn hàng</h1>
            <div className="grid grid-cols-1 md:grid-cols-10 gap-8">
              <div className="md:col-span-6 flex flex-col">
                <div className="flex flex-col gap-2">
                  <OrderProductList items={cartItems} />
                  <OrderRecipientForm
                    value={recipient}
                    onChange={setRecipient}
                  />
                </div>
                {recipientError && (
                  <div className="mt-4 text-red-600 text-sm">
                    {recipientError}
                  </div>
                )}
              </div>
              <div className="md:col-span-4">
                <OrderPaymentMethod
                  value={payment}
                  onChange={(v: PaymentMethod) => {
                    setPayment(v);
                    console.log("Chọn phương thức:", v);
                  }}
                  items={cartItems}
                  onConfirmPayment={() => setShowPayment(true)}
                />
              </div>
            </div>
          </>
        )}
      </div>
      {showResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center animate-fade-in">
            {showResult === "success" ? (
              <>
                <CheckCircle2
                  className="text-green-600 animate-bounce"
                  size={80}
                />
                <div className="mt-4 text-green-700 font-bold text-xl">
                  Thanh toán thành công!
                </div>
              </>
            ) : (
              <>
                <XCircle className="text-red-600 animate-bounce" size={80} />
                <div className="mt-4 text-red-700 font-bold text-xl">
                  Thanh toán thất bại!
                </div>
              </>
            )}
          </div>
          <style>
            {`
              .animate-fade-in { animation: fadeIn 0.8s; }
              @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
              .animate-bounce { animation: bounce 1s infinite; }
              @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            `}
          </style>
        </div>
      )}
    </div>
  );
}
