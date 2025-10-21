import React from "react";
import { CreditCard, Wallet2, DollarSign } from "lucide-react";

type PaymentMethod = "cod" | "momo" | "VnPay";

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

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

export default function OrderPaymentMethod({
  value,
  onChange,
  items,
  onConfirmPayment,
}: {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
  items: CartItem[];
  onConfirmPayment?: () => void;
}) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const shipping = subtotal >= 1500000 ? 0 : 15000;
  const total = subtotal + shipping;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8 flex flex-col items-center">
      {/* Tóm tắt đơn hàng */}
      <h3 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h3>
      <div className="space-y-3 mb-6 w-full">
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
            Mua thêm {formatVND(1500000 - subtotal)} để được miễn phí vận chuyển
          </div>
        )}
      </div>
      <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-300 mb-6 w-full">
        <span>Tổng cộng</span>
        <span>{formatVND(total)}</span>
      </div>
      {/* Phương thức thanh toán - dọc, giữ nguyên kích thước */}
      <h2 className="text-xl font-bold mb-4 w-full">Phương thức thanh toán</h2>
      <div className="flex flex-col gap-4 w-full items-center">
        <label
          className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg border transition w-full ${
            value === "cod"
              ? "border-black bg-gray-50 shadow"
              : "border-gray-200 bg-white"
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={value === "cod"}
            onChange={() => onChange("cod")}
            style={{ display: "none" }}
          />
          <DollarSign className="w-8 h-8 text-black" />
          <span className="font-medium">Tiền mặt</span>
        </label>
        <label
          className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg border transition w-full ${
            value === "momo"
              ? "border-black bg-gray-50 shadow"
              : "border-gray-200 bg-white"
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={value === "momo"}
            onChange={() => onChange("momo")}
            style={{ display: "none" }}
          />
          <Wallet2 className="w-8 h-8 text-pink-500" />
          <span className="font-medium">MOMO</span>
        </label>
        <label
          className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg border transition w-full ${
            value === "VnPay"
              ? "border-black bg-gray-50 shadow"
              : "border-gray-200 bg-white"
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={value === "VnPay"}
            onChange={() => onChange("VnPay")}
            style={{ display: "none" }}
          />
          <CreditCard className="w-8 h-8 text-blue-600" />
          <span className="font-medium">VnPay</span>
        </label>
      </div>
      {/* Nút xác nhận thanh toán */}
      {value && (
        <button
          className="mt-8 w-full py-3 bg-black text-white font-semibold rounded hover:bg-gray-900 transition"
          onClick={onConfirmPayment}
        >
          Xác nhận thanh toán
        </button>
      )}
    </div>
  );
}
