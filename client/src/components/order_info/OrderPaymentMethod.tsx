import React from "react";
import { CreditCard, Wallet2, DollarSign } from "lucide-react";

type PaymentMethod = "cod" | "momo" | "paypal";

export default function OrderPaymentMethod({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
      <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>
      <div className="flex flex-row gap-4 justify-between">
        <label
          className={`flex flex-col items-center gap-2 cursor-pointer p-4 rounded-lg border transition w-full ${
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
            className="accent-black mb-2"
            style={{ display: "none" }}
          />
          <DollarSign className="w-8 h-8 text-black" />
          <span className="font-medium mt-2">Tiền mặt</span>
        </label>
        <label
          className={`flex flex-col items-center gap-2 cursor-pointer p-4 rounded-lg border transition w-full ${
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
            className="accent-black mb-2"
            style={{ display: "none" }}
          />
          <Wallet2 className="w-8 h-8 text-pink-500" />
          <span className="font-medium mt-2">MOMO</span>
        </label>
        <label
          className={`flex flex-col items-center gap-2 cursor-pointer p-4 rounded-lg border transition w-full ${
            value === "paypal"
              ? "border-black bg-gray-50 shadow"
              : "border-gray-200 bg-white"
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={value === "paypal"}
            onChange={() => onChange("paypal")}
            className="accent-black mb-2"
            style={{ display: "none" }}
          />
          <CreditCard className="w-8 h-8 text-blue-600" />
          <span className="font-medium mt-2">Paypal</span>
        </label>
      </div>
    </div>
  );
}
