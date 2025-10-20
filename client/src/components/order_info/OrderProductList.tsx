import React from "react";

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

export default function OrderProductList({ items }: { items: CartItem[] }) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const shipping = subtotal >= 1500000 ? 0 : 30000;
  const total = subtotal + shipping;

  return (
    <div className="bg-white border border-gray-200 p-4 mb-8">
      <h2 className="text-xl font-bold mb-4">Sản phẩm</h2>
      {items.length === 0 ? (
        <div className="text-gray-500">
          Không có sản phẩm nào trong giỏ hàng.
        </div>
      ) : (
        <>
          <div className="divide-y mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center py-3 gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover bg-gray-100 rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    Kích cỡ: {item.size} | Màu: {item.color}
                  </div>
                  <div className="text-sm text-gray-600">
                    Số lượng: {item.quantity}
                  </div>
                </div>
                <div className="font-semibold text-base">
                  {formatVND(Number(item.price) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          {/* Tóm tắt đơn hàng */}
          <div className="bg-gray-50 border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3 mb-6">
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
                  Mua thêm {formatVND(1500000 - subtotal)} để được miễn phí vận
                  chuyển
                </div>
              )}
            </div>
            <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-300">
              <span>Tổng cộng</span>
              <span>{formatVND(total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
