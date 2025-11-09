import { CheckCircle } from "lucide-react";
import OrderItem from "./OrderItem";
import { useOrder } from "../../../shared/contexts/orderContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../../shared/contexts/authContext";
import ReviewPopup from "../Review/ReviewPopup.tsx";
const apiUrl = import.meta.env.VITE_API_URL;
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
  const { setOrderItems, setOrderSource } = useOrder();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [allReviewed, setAllReviewed] = useState(false);

  useEffect(() => {
    async function checkAllReviewed() {
      if (!order.orderProducts) return;
      let all = true;
      const user_id = user?.user_id;
      for (const item of order.orderProducts) {
        const res = await fetch(
          `${apiUrl}/review/check?order_id=${order.order_id}&variant_id=${item.variant_id}&user_id=${user_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        const data = await res.json();

        if (!data.exists) {
          all = false;
          break;
        }
      }
      setAllReviewed(all);
    }
    if (order.order_status === "Đã giao") {
      checkAllReviewed();
    }
  }, [order, user, token]);

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
    setOrderSource("buyAgain");
    navigate("/order-info");
  };

  const handleViewDetail = () => {
    navigate(`/order-detail/${order.order_id}`, { state: { order } });
  };

  const handleReview = () => setShowReview(true);

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
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
        Đã đặt vào {new Date(order.order_date).toLocaleDateString("vi-VN")}
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
        <button
          className="flex-1 border border-gray-300 py-3 font-semibold hover:bg-gray-100 transition"
          onClick={handleViewDetail}
        >
          Xem chi tiết
        </button>
        {order.order_status === "Đã giao" &&
          (allReviewed ? (
            <button
              className="flex-1 border border-green-500 py-3 font-semibold text-green-700 bg-green-50 cursor-default"
              disabled
            >
              Đã đánh giá
            </button>
          ) : (
            <button
              className="flex-1 border border-yellow-500 py-3 font-semibold text-yellow-700 hover:bg-yellow-50 transition"
              onClick={handleReview}
            >
              Đánh giá
            </button>
          ))}
      </div>

      {/* Popup đánh giá */}
      {showReview && (
        <ReviewPopup order={order} onClose={() => setShowReview(false)} />
      )}
    </div>
  );
}
