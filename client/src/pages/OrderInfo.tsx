import React, { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import OrderProductList from "../components/order_info/OrderProductList";
import OrderRecipientForm from "../components/order_info/OrderRecipientForm";
import OrderPaymentMethod from "../components/order_info/OrderPaymentMethod";
import PaymentComponent from "../components/order_info/PaymentComponent";
import VnpayPaymentComponent from "../components/order_info/VnpayPaymentComponent";
import CashPaymentComponent from "../components/order_info/CashPaymentComponent";
import { v4 as uuidv4 } from "uuid";
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

interface Voucher {
  voucher_id: string;
  voucher_code: string;
  voucher_status: string;
  discount_value: number;
  min_order_value: number;
  usage_limit?: number;
  used_count?: number;
  start_date?: string;
  end_date?: string;
  // Thêm các trường khác nếu cần
}

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
  const [showResult, setShowResult] = useState<"success" | "fail" | null>(null);
  const [recipientError, setRecipientError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState(() => uuidv4());
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [selectedOrderVoucher, setSelectedOrderVoucher] =
    useState<Voucher | null>(null);
  const [selectedShippingVoucher, setSelectedShippingVoucher] =
    useState<Voucher | null>(null);
  const [finalTotal, setFinalTotal] = useState(0); // thêm state này
  const { orderItems } = useOrder();
  const { user } = useAuth();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const userId = user?.user_id ? user.user_id : null;

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

  useEffect(() => {
    fetch("http://localhost:8080/api/vouchers")
      .then((res) => res.json())
      .then((data) => setVouchers(data));
  }, []);

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

  const handleCreateOrderCOD = async () => {
    if (!validateRecipient()) return;
    try {
      // 1. Tạo đơn hàng
      const orderRes = await fetch("http://localhost:8080/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          order_date: new Date().toISOString(),
          order_status: "pending",
          total_amount: total,
          user_id: user?.user_id ?? userId,
          voucher_id: selectedOrderVoucher?.voucher_id ?? null,
          shipping_voucher_id: selectedShippingVoucher?.voucher_id ?? null,
          recipient_name: recipient.name,
          recipient_phone: recipient.phone,
          recipient_email: recipient.email,
          recipient_address: recipient.address,
          notes: recipient.note,
          products: cartItems.map((item) => ({
            variant_id: item.id,
            quantity: item.quantity,
            price_at_time: item.price * item.quantity,
          })),
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message);

      // 2. Tạo thanh toán
      const paymentRes = await fetch("http://localhost:8080/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method: "cod",
          payment_status: "pending",
          payment_info: "Thanh toán khi nhận hàng",
          paid_at: null,
          order_id: orderId,
          user_id: user?.user_id ?? userId,
          voucher_id: null,
        }),
      });
      const paymentData = await paymentRes.json();
      if (paymentData.success === false) throw new Error(paymentData.message);

      setShowResult("success");
      // Xử lý chuyển trang hoặc thông báo thành công ở đây
    } catch (err) {
      setShowResult("fail");
      // Hiển thị thông báo lỗi nếu cần
    }
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

  const validateRecipient = () => {
    if (
      !recipient.name ||
      !recipient.phone ||
      !recipient.email ||
      !recipient.address
    ) {
      setRecipientError("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return false;
    }
    setRecipientError("");
    return true;
  };

  const now = new Date();
  const validVouchers = vouchers.filter(
    (voucher) =>
      voucher.voucher_status === "active" &&
      subtotal >= Number(voucher.min_order_value) &&
      (!voucher.usage_limit ||
        (voucher.used_count ?? 0) < voucher.usage_limit) &&
      (!voucher.start_date || new Date(voucher.start_date) <= now) &&
      (!voucher.end_date || new Date(voucher.end_date) >= now)
  );

  const canApplyVoucher = (voucher: Voucher) =>
    voucher.voucher_status === "active" &&
    subtotal >= Number(voucher.min_order_value) &&
    (!voucher.usage_limit || (voucher.used_count ?? 0) < voucher.usage_limit) &&
    (!voucher.start_date || new Date(voucher.start_date) <= now) &&
    (!voucher.end_date || new Date(voucher.end_date) >= now);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        {showPayment ? (
          payment === "momo" ? (
            <PaymentComponent
              cartItems={cartItems}
              recipient={recipient}
              amount={finalTotal} // <-- giá cuối cùng đã trừ voucher
              onBack={() => setShowPayment(false)}
            />
          ) : payment === "VnPay" ? (
            <VnpayPaymentComponent
              cartItems={cartItems}
              recipient={recipient}
              amount={finalTotal}
              onBack={() => setShowPayment(false)}
            />
          ) : (
            <CashPaymentComponent
              cartItems={cartItems}
              recipient={recipient}
              amount={finalTotal}
              orderId={orderId}
              onBack={() => setShowPayment(false)}
              onConfirm={handleCreateOrderCOD}
            />
          )
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
                  onConfirmPayment={() => {
                    if (validateRecipient()) setShowPayment(true);
                  }}
                  onTotalChange={setFinalTotal} // truyền hàm này
                  onOrderVoucherChange={setSelectedOrderVoucher}
                  onShippingVoucherChange={setSelectedShippingVoucher}
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
