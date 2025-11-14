import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";

const apiUrl = import.meta.env.VITE_API_URL;

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

interface MomoResponse {
  qrCodeUrl?: string;
  payUrl?: string;
  message?: string;
  resultCode?: number;
}

interface OrderData {
  order_date: string;
  total_amount: number;
  order_discount: number;
  shipping_fee: number;
  user_id: number | null;
  voucher_id: string | number | null;
  shipping_voucher_id: string | number | null;
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string;
  recipient_address: string;
  notes: string;
  products: Array<{
    variant_id: string;
    quantity: number;
    price_at_time: number;
  }>;
}

export default function MomoPaymentComponent({
  cartItems,
  recipient,
  amount,
  orderId,
  orderData,
  onBack,
  onConfirm,
}: {
  cartItems: CartItem[];
  recipient: RecipientInfo;
  amount: number;
  orderId: string;
  orderData: OrderData;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const [momo, setMomo] = useState<MomoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fee = Math.round(amount * 0.05); // Phí 5%
  const total = amount + fee;

  // Gọi API MoMo để lấy QR code, tạo order "Chờ xác nhận" + payment "pending"
  useEffect(() => {
    async function fetchMomoQR() {
      setLoading(true);
      try {
        // 1. Tạo order với status "Chờ xác nhận"
        const orderRes = await fetch(`${apiUrl}/order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            order_status: "Chờ xác nhận",
            ...orderData,
          }),
        });
        const orderResult = await orderRes.json();
        if (!orderResult.success) {
          throw new Error(orderResult.message || "Không thể tạo đơn hàng");
        }
        console.log("✅ Created order with status 'Chờ xác nhận':", orderId);

        // 2. Tạo payment với status "pending"
        const paymentRes = await fetch(`${apiUrl}/payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_method: "momo",
            payment_status: "pending",
            payment_info: `Đang chờ thanh toán MoMo - Đơn hàng #${orderId}`,
            paid_at: null,
            order_id: orderId,
            user_id: orderData.user_id,
            voucher_id: null,
          }),
        });
        const paymentResult = await paymentRes.json();
        if (!paymentResult.success && paymentResult.success !== undefined) {
          throw new Error(paymentResult.message || "Không thể tạo payment");
        }
        console.log("✅ Created payment with status 'pending'");

        // 3. Gọi MoMo API để lấy QR
        const res = await fetch(`${apiUrl}/payment/momo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            orderId,
            orderInfo: `Thanh toán đơn hàng #${orderId}`,
          }),
        });

        const data = await res.json();
        console.log("MoMo API response:", data);
        setMomo(data);
      } catch (err: any) {
        console.error("MoMo API error:", err);
        setMomo({ message: err.message || "Không thể tạo giao dịch MoMo." });
      }
      setLoading(false);
    }
    fetchMomoQR();
  }, [total, orderId, orderData]);

  // Auto-polling: Kiểm tra payment status mỗi 3s
  useEffect(() => {
    if (!momo?.qrCodeUrl) return; // Chỉ poll khi đã có QR

    let pollCount = 0;
    const maxPolls = 100; // 100 x 3s = 5 phút timeout

    const intervalId = setInterval(async () => {
      pollCount++;
      console.log(`🔄 Polling payment status... (${pollCount}/${maxPolls})`);

      try {
        const res = await fetch(`${apiUrl}/payment/status/${orderId}`);
        const data = await res.json();

        if (data.success && data.payment) {
          const paymentStatus = data.payment.payment_status;
          console.log("Payment status:", paymentStatus);

          if (paymentStatus === "paid" || paymentStatus === "Đã thanh toán") {
            clearInterval(intervalId);
            console.log("✅ Payment successful! Calling onConfirm...");
            onConfirm();
          } else if (paymentStatus === "failed") {
            clearInterval(intervalId);
            setError("Thanh toán thất bại. Vui lòng thử lại.");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }

      // Timeout sau 5 phút
      if (pollCount >= maxPolls) {
        clearInterval(intervalId);
        setError("Hết thời gian chờ thanh toán. Vui lòng thử lại.");
      }
    }, 3000); // Poll mỗi 3 giây

    return () => clearInterval(intervalId);
  }, [momo, orderId, onConfirm]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-10">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-blue-600 font-semibold hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay về
        </button>

        <div className="text-3xl font-bold mb-4 text-pink-600 text-center tracking-wide">
          Thanh toán bằng MoMo
        </div>

        <div className="mb-6 text-center">
          <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full font-semibold text-base shadow">
            Mã đơn hàng: <span className="font-bold">#{orderId}</span>
          </span>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold mb-2 text-gray-800 text-lg">Sản phẩm</h3>
            <ul className="space-y-2">
              {cartItems.map((item) => (
                <li key={item.id} className="text-gray-700 text-base">
                  <span className="font-semibold">{item.name}</span> -{" "}
                  {item.size}, {item.color} x {item.quantity}{" "}
                  <span className="text-gray-500">
                    ({item.price.toLocaleString()}đ)
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2 text-gray-800 text-lg">
              Thông tin người nhận
            </h3>
            <div className="text-gray-700 text-base space-y-1">
              <div>
                <b>Họ tên:</b> {recipient.name}
              </div>
              <div>
                <b>Điện thoại:</b> {recipient.phone}
              </div>
              <div>
                <b>Email:</b> {recipient.email}
              </div>
              <div>
                <b>Địa chỉ:</b> {recipient.address}
              </div>
              {recipient.note && (
                <div>
                  <b>Ghi chú:</b> {recipient.note}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center text-lg font-semibold py-2 border-b border-gray-200">
            <span>Tổng tiền</span>
            <span className="text-pink-600 text-2xl font-bold">
              {total.toLocaleString()}đ
            </span>
          </div>
          <div className="flex justify-between items-center text-base py-2">
            <span>Phí giao dịch (5%)</span>
            <span className="text-gray-700">{fee.toLocaleString()}đ</span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="mb-8 flex flex-col items-center">
          <h3 className="font-bold mb-4 text-gray-800 text-lg">
            Quét mã QR để thanh toán
          </h3>
          <div className="p-4 bg-white border-2 border-gray-300 rounded-lg">
            {loading ? (
              <div className="w-[256px] h-[256px] flex items-center justify-center text-gray-500">
                Đang tạo mã QR...
              </div>
            ) : momo?.qrCodeUrl ? (
              <QRCode value={momo.qrCodeUrl} size={256} />
            ) : (
              <div className="w-[256px] h-[256px] flex items-center justify-center text-red-500 text-center p-4">
                {momo?.message || "Không thể tạo mã QR"}
              </div>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-600 text-center">
            Mở ứng dụng MoMo → Quét mã → Xác nhận thanh toán
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Đang chờ thanh toán...</span>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
