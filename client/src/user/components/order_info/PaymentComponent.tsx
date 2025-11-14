import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useAuth } from "../../../shared/contexts/authContext";
import { v4 as uuidv4 } from "uuid";
import { ArrowLeft } from "lucide-react";
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
}

export default function PaymentComponent({
  cartItems,
  recipient,
  amount,
  onBack,
}: {
  cartItems: CartItem[];
  recipient: RecipientInfo;
  amount: number;
  onBack: () => void;
}) {
  const [momo, setMomo] = useState<MomoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "paid" | "failed"
  >("pending");
  const { user } = useAuth();

  const fee = Math.round(amount * 0.05); // Phí giao dịch 5%
  const total = amount + fee;

  // Khi component mount hoặc mỗi lần mở lại trang, sinh lại orderId
  const [orderId, setOrderId] = useState(() => uuidv4());

  useEffect(() => {
    setOrderId(uuidv4());
  }, []);

  useEffect(() => {
    async function fetchMomo() {
      setLoading(true);
      try {
        // Prepare order data to store temporarily
        const orderData = {
          order_date: new Date().toISOString(),
          total_amount: total,
          user_id: user?.user_id || null,
          voucher_id: null, // Add voucher if available
          products: cartItems.map((item) => ({
            variant_id: item.id,
            quantity: item.quantity,
            price_at_time: item.price,
          })),
        };

        const res = await fetch(`${apiUrl}/payment/momo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            orderId,
            orderInfo: `Thanh toán đơn hàng #${orderId}`,
            orderData, // Send order data to store in cache
          }),
        });

        const data = await res.json();
        console.log("MoMo payment response:", data);
        setMomo(data);
      } catch (err) {
        setMomo({ message: "Không thể tạo giao dịch MOMO." });
      }
      setLoading(false);
    }
    fetchMomo();
  }, [total, orderId, user, cartItems]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/order/${orderId}`);
        const data = await res.json();

        console.log("Polling order status:", data);

        if (data.success && data.order) {
          const orderStatus = data.order.order_status;
          setPaymentStatus(orderStatus);

          if (orderStatus === "paid") {
            clearInterval(interval);
            setTimeout(() => {
              alert("✅ Thanh toán thành công!");
              window.location.href = "/cart";
            }, 500);
          } else if (orderStatus === "failed") {
            clearInterval(interval);
            setTimeout(() => {
              alert("❌ Thanh toán thất bại!");
              window.location.href = "/cart";
            }, 500);
          }
          // Nếu "pending" thì tiếp tục polling
        }
      } catch (err) {
        console.error("Error polling order status:", err);
      }
    }, 3000); // Poll mỗi 3 giây

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="min-h-screen  flex items-start">
      <div className="w-full px-0 py-10 mt-6">
        <div className="w-full max-w-5xl mx-auto bg-white rounded-xl py-10 px-12 shadow-2xl border border-gray-300">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-black font-semibold hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay về
          </button>

          <div className="flex items-center gap-4 mb-2">
            <img
              src="https://static.momocdn.net/app/img/payment/logo.png"
              alt="MOMO"
              className="h-10"
            />
            <div>
              <div className="text-2xl font-bold text-gray-800">
                Nạp số dư trực tiếp bằng MoMo Payment
              </div>
              <div className="text-gray-500 text-sm">
                Nạp Dcoin tự động liên kết với MoMo, hoàn thành tức thì. Phí 5%
              </div>
            </div>
          </div>
          <hr className="my-4 border-gray-200" />
          {/* Thông tin số tiền */}
          <div className="flex flex-wrap items-center justify-between mb-4 text-lg font-semibold text-gray-700">
            <div>
              Số tiền:{" "}
              <span className="text-black">{amount.toLocaleString()}đ</span>
            </div>
            <div>
              Phí giao dịch:{" "}
              <span className="text-black">{fee.toLocaleString()}đ (5%)</span>
            </div>
            <div>
              Tổng tiền:{" "}
              <span className="text-black">{total.toLocaleString()}đ</span>
            </div>
          </div>
          <hr className="my-4 border-gray-200" />
          {/* Nội dung đơn hàng */}
          <div className="mb-6">
            <div className="text-base font-semibold mb-2 text-gray-800">
              Thanh toán đơn hàng{" "}
              <span className="text-pink-600 font-bold">#{orderId}</span>
            </div>
            {paymentStatus === "pending" && (
              <div className="text-orange-600 font-semibold animate-pulse">
                ⏳ Đang chờ thanh toán...
              </div>
            )}
            {paymentStatus === "paid" && (
              <div className="text-green-600 font-semibold">
                ✅ Thanh toán thành công!
              </div>
            )}
            {paymentStatus === "failed" && (
              <div className="text-red-600 font-semibold">
                ❌ Thanh toán thất bại!
              </div>
            )}
          </div>
          {/* QR và hướng dẫn */}
          <div className="flex flex-col md:flex-row gap-10 items-start justify-center">
            {/* QR bên trái */}
            <div className="flex flex-col items-center md:w-[320px] w-full">
              <div className="p-0 flex items-center justify-center">
                {loading ? (
                  <div className="text-gray-500 w-[220px] h-[220px] flex items-center justify-center">
                    Đang tạo QR...
                  </div>
                ) : momo?.qrCodeUrl ? (
                  <QRCode value={momo.qrCodeUrl} size={220} />
                ) : (
                  <div className="text-gray-500 w-[220px] h-[220px] flex items-center justify-center">
                    {momo?.message || "Không thể tạo mã QR."}
                  </div>
                )}
              </div>
            </div>
            {/* Hướng dẫn bên phải */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="font-bold text-lg mb-4 text-gray-800">
                Thực hiện theo hướng dẫn sau để thanh toán:
              </div>
              <div className="space-y-2 text-base text-gray-700">
                <div>
                  <b>Bước 1:</b> Mở ứng dụng <b>MoMo</b> để thanh toán
                </div>
                <div>
                  <b>Bước 2:</b> Chọn <b>"Thanh Toán"</b> và quét mã QR tại
                  hướng dẫn này
                </div>
                <div>
                  <b>Bước 3:</b> Hoàn thành các bước thanh toán theo hướng dẫn
                  và đợi hệ thống xử lý trong giây lát
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
