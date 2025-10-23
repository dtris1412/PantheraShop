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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-blue-600 font-semibold hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay về
        </button>
        <div className="text-3xl font-bold mb-4 text-green-700 text-center tracking-wide">
          Thanh toán khi nhận hàng (COD)
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
            <span className="text-green-700 text-2xl font-bold">
              {total.toLocaleString()}đ
            </span>
          </div>
          <div className="flex justify-between items-center text-base py-2">
            <span>Phí giao dịch</span>
            <span className="text-gray-700">{fee.toLocaleString()}đ</span>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            className="px-10 py-3 bg-green-600 text-white rounded-lg font-bold text-lg shadow hover:bg-green-700 transition"
            onClick={onConfirm}
          >
            Xác nhận thanh toán COD
          </button>
        </div>
      </div>
    </div>
  );
}
