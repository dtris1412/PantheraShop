import React, { useEffect, useState } from "react";
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

interface Voucher {
  voucher_id: number | string;
  voucher_code: string;
  voucher_status?: string;
  discount_value?: number | string;
  min_order_value?: number | string;
  usage_limit?: number;
  used_count?: number;
  start_date?: string;
  end_date?: string;
  discount_type?: "order" | "shipping";
}

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value
  );

export default function OrderPaymentMethod({ ...props }) {
  const { value, onChange, items, onConfirmPayment, onTotalChange } = props;
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedOrderVoucher, setSelectedOrderVoucher] =
    useState<Voucher | null>(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/vouchers")
      .then((res) => res.json())
      .then((data) => setVouchers(Array.isArray(data) ? data : []));
  }, []);

  const subtotal = items.reduce(
    (sum: number, item: CartItem) => sum + Number(item.price) * item.quantity,
    0
  );
  const shipping = subtotal >= 1500000 ? 0 : 15000;
  const orderDiscount = selectedOrderVoucher
    ? Number(selectedOrderVoucher.discount_value)
    : 0;
  const total = subtotal - orderDiscount + shipping;

  useEffect(() => {
    if (props.onTotalChange) {
      props.onTotalChange(total);
    }
  }, [total]);

  useEffect(() => {
    if (props.onOrderVoucherChange)
      props.onOrderVoucherChange(selectedOrderVoucher);
  }, [selectedOrderVoucher]);

  const canApplyVoucher = (voucher: Voucher) => {
    if (!voucher) return false;
    if (voucher.voucher_status && voucher.voucher_status !== "active")
      return false;
    if (
      voucher.min_order_value !== undefined &&
      subtotal < Number(voucher.min_order_value)
    )
      return false;
    if (
      typeof voucher.usage_limit === "number" &&
      (voucher.used_count ?? 0) >= voucher.usage_limit
    )
      return false;
    const now = new Date();
    if (voucher.start_date && new Date(voucher.start_date) > now) return false;
    if (voucher.end_date && new Date(voucher.end_date) < now) return false;
    return true;
  };

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

        {/* --- DI CHUYỂN 2 DROPDOWN VOUCHER LÊN ĐÂY --- */}
        <div className="mb-2 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn voucher giảm giá đơn hàng
          </label>
          <select
            className="w-full px-4 py-2 border rounded bg-white text-sm"
            value={selectedOrderVoucher?.voucher_id ?? ""}
            onChange={(e) => {
              const v = vouchers.find(
                (v) =>
                  String(v.voucher_id) === e.target.value &&
                  v.discount_type === "order"
              );
              setSelectedOrderVoucher(v ?? null);
            }}
          >
            <option value="">-- Không chọn voucher --</option>
            {vouchers
              .filter((v) => v.discount_type === "order")
              .map((voucher) => {
                const enabled = canApplyVoucher(voucher);
                const remain =
                  typeof voucher.usage_limit === "number"
                    ? voucher.usage_limit
                    : "";
                return (
                  <option
                    key={voucher.voucher_id}
                    value={voucher.voucher_id}
                    disabled={!enabled}
                    style={{
                      color: enabled ? "#222" : "#bbb",
                      fontSize: "13px",
                      padding: "6px 0",
                    }}
                  >
                    {voucher.voucher_code}
                    {Number(voucher.discount_value || 0) > 0
                      ? ` - ${formatVND(Number(voucher.discount_value || 0))}`
                      : ""}
                    {remain !== "" ? ` | SL: ${remain}` : ""}
                    {!enabled ? " (Không đủ điều kiện)" : ""}
                  </option>
                );
              })}
          </select>
        </div>
        {/* Hiển thị số tiền giảm, màu xanh */}
        {orderDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-semibold mb-1">
            <span>Giảm giá đơn hàng</span>
            <span>-{formatVND(orderDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-300 mb-6 w-full">
          <span>Tổng cộng</span>
          <span>{formatVND(total)}</span>
        </div>
        {subtotal < 1500000 && (
          <div className="text-xs text-gray-600 pt-2 border-t border-gray-300">
            Mua thêm {formatVND(1500000 - subtotal)} để được miễn phí vận chuyển
          </div>
        )}
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
