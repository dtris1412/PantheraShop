import React from "react";
import { ArrowLeft } from "lucide-react";

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

export default function CashPaymentComponent({
  cartItems,
  recipient,
  amount,
  orderId,
  onBack,
  onConfirm,
}: {
  cartItems: CartItem[];
  recipient: RecipientInfo;
  amount: number;
  orderId: string;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const fee = 0;
  const total = amount + fee;

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
          <div className="text-2xl font-bold mb-6 text-gray-800">
            Thanh toán khi nhận hàng (COD)
          </div>
          <div className="mb-4 text-base font-semibold text-gray-700">
            Mã đơn hàng:{" "}
            <span className="text-blue-600 font-bold">#{orderId}</span>
          </div>
          <div className="mb-6">
            <h3 className="font-bold mb-2">Sản phẩm</h3>
            <ul className="list-disc pl-5 text-gray-700">
              {cartItems.map((item) => (
                <li key={item.id}>
                  {item.name} - {item.size}, {item.color} x {item.quantity} (
                  {item.price.toLocaleString()}đ)
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="font-bold mb-2">Thông tin người nhận</h3>
            <div className="text-gray-700">
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
          <div className="mb-8 flex flex-wrap items-center gap-8 text-lg font-semibold text-gray-700">
            <div>
              Tổng tiền:{" "}
              <span className="text-black">{total.toLocaleString()}đ</span>
            </div>
            <div>
              Phí giao dịch:{" "}
              <span className="text-black">{fee.toLocaleString()}đ</span>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              className="px-8 py-3 bg-green-600 text-white rounded font-semibold text-lg hover:bg-green-700 transition"
              onClick={onConfirm}
            >
              Xác nhận thanh toán COD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
