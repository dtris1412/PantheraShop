import React, { useEffect, useState } from "react";
import { useAuth } from "../../../shared/contexts/authContext";
import { v4 as uuidv4 } from "uuid";
import { ArrowLeft } from "lucide-react";

const BANKS = [
  { code: "VNPAYQR", name: "VNPAY QR" },
  { code: "VISA", name: "Thẻ quốc tế (Visa/MasterCard/JCB)" },
  { code: "NCB", name: "Ngân hàng NCB" },
  { code: "AGRIBANK", name: "Ngân hàng Agribank" },
  { code: "BIDV", name: "Ngân hàng BIDV" },
  { code: "VIETCOMBANK", name: "Ngân hàng Vietcombank" },
  // ...thêm các ngân hàng khác nếu muốn
];

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

interface VnpayResponse {
  payUrl?: string;
  message?: string;
}

export default function VnpayPaymentComponent({
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
  const [vnpay, setVnpay] = useState<VnpayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [bankCode, setBankCode] = useState<string>("");
  const [orderId, setOrderId] = useState(() => uuidv4());
  const fee = Math.round(amount * 0.05);
  const total = amount + fee;

  // Khi chọn ngân hàng và nhấn "Thanh toán", gọi API tạo giao dịch
  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/payment/vnpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          orderId,
          orderInfo: `Thanh toán đơn hàng #${orderId}`,
          bankCode,
        }),
      });
      const data = await res.json();
      setVnpay(data);
      if (data.payUrl) {
        window.location.href = data.payUrl; // redirect sang VNPAY
      }
    } catch (err) {
      setVnpay({ message: "Không thể tạo giao dịch VNPAY." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-start">
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
              src="https://pay.vnpay.vn/images/logo_vnpay.png"
              alt="VNPAY"
              className="h-10"
            />
            <div>
              <div className="text-2xl font-bold text-gray-800">
                Thanh toán qua VNPAY
              </div>
              <div className="text-gray-500 text-sm">
                Thanh toán tự động liên kết với VNPAY, hoàn thành tức thì. Phí
                5%
              </div>
            </div>
          </div>
          <hr className="my-4 border-gray-200" />
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
          <div className="mb-6">
            <div className="text-base font-semibold mb-2 text-gray-800">
              Thanh toán đơn hàng{" "}
              <span className="text-blue-600 font-bold">#{orderId}</span>
            </div>
          </div>
          <div className="mb-8">
            <label className="block font-semibold mb-2 text-gray-700">
              Chọn ngân hàng/thẻ để thanh toán:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {BANKS.map((bank) => (
                <button
                  key={bank.code}
                  type="button"
                  className={`border rounded px-4 py-2 text-left ${
                    bankCode === bank.code
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 bg-white"
                  } hover:border-blue-400`}
                  onClick={() => setBankCode(bank.code)}
                >
                  {bank.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <button
              className="px-8 py-3 bg-blue-600 text-white rounded font-semibold text-lg hover:bg-blue-700 transition"
              disabled={!bankCode || loading}
              onClick={handlePay}
            >
              {loading ? "Đang chuyển hướng..." : "Thanh toán"}
            </button>
            {vnpay?.message && (
              <div className="mt-6 text-red-600 font-semibold">
                {vnpay.message}
              </div>
            )}
          </div>
          <div className="mt-8 text-gray-600 text-sm text-center">
            Sau khi nhấn "Thanh toán", bạn sẽ được chuyển sang cổng VNPAY để
            nhập thông tin thẻ/ngân hàng và hoàn tất giao dịch.
          </div>
        </div>
      </div>
    </div>
  );
}
