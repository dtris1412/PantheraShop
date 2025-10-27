import { CheckCircle } from "lucide-react";
import OrderItem from "./OrderItem";
import { useOrder } from "../../contexts/orderContext";
import { useNavigate } from "react-router-dom";

interface Order {
  order_id: string;
  order_status: string;
  total_amount: number;
  order_date: string;
  orderProducts?: any[];
}

function formatVND(value: number | string) {
  return Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function OrderCard({ order }: { order: Order }) {
  const { setOrderItems } = useOrder();
  const navigate = useNavigate();

  // Chuyển đổi dữ liệu orderProducts sang dạng CartItem
  const handleBuyAgain = () => {
    if (!order.orderProducts) return;
    const items = order.orderProducts.map((item) => ({
      id: String(item.variant_id),
      product_id: item.Variant?.product_id,
      name: item.Variant?.Product?.product_name,
      price: Number(item.price_at_time) / item.quantity,
      size: item.Variant?.variant_size,
      color: item.Variant?.variant_color,
      image: item.Variant?.Product?.product_image,
      quantity: item.quantity,
    }));
    setOrderItems(items);
    navigate("/order-info");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-gray-50 border-b">
        <div>
          <span className="font-bold text-xl mr-2">{order.order_id}</span>
          {order.order_status === "Delivered" && (
            <CheckCircle className="inline-block text-green-600 w-5 h-5 align-middle" />
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-green-100 text-green-700 px-4 py-1 rounded font-semibold text-sm">
            {order.order_status}
          </span>
          <span className="text-2xl font-bold">
            {formatVND(order.total_amount)}
          </span>
        </div>
      </div>
      <div className="px-6 pt-2 pb-4 text-gray-500 text-sm border-b">
        Placed on {new Date(order.order_date).toLocaleDateString("vi-VN")}
      </div>
      <div className="px-6 py-4">
        {order.orderProducts?.map((item, idx) => (
          <OrderItem key={idx} item={item} />
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 px-6 pb-6">
        <button
          className="flex-1 border border-black py-3 font-semibold hover:bg-gray-100 transition"
          onClick={handleBuyAgain}
        >
          Mua lại
        </button>
        <button className="flex-1 border border-gray-300 py-3 font-semibold hover:bg-gray-100 transition">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}
