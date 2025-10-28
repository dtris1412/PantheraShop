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
  const shipping = subtotal >= 1500000 ? 0 : 15000;
  const total = subtotal + shipping;

  return (
    <div className="bg-white border border-gray-200 p-4 mb-8">
      <h2 className="text-xl font-bold mb-4">Sản phẩm</h2>
      {items.length === 0 ? (
        <div className="text-gray-500">
          Không có sản phẩm nào trong giỏ hàng.
        </div>
      ) : (
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
      )}
    </div>
  );
}
