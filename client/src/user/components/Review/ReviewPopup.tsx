import { useState } from "react";
import { useAuth } from "../../../shared/contexts/authContext";
import { showToast } from "../../../shared/components/Toast";

interface ReviewPopupProps {
  order: any;
  onClose: () => void;
}

export default function ReviewPopup({ order, onClose }: ReviewPopupProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const token = localStorage.getItem("token");
  const user_id = useAuth().user?.user_id;

  const handleSubmitReview = async () => {
    try {
      for (const item of order.orderProducts || []) {
        await fetch("http://localhost:8080/api/review", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: order.order_id,
            variant_id: item.variant_id,
            user_id,
            rating,
            comment,
          }),
        });
      }
      setRating(5);
      setComment("");
      onClose();
      showToast("Đánh giá thành công!", "success");
    } catch (error) {
      showToast("Gửi đánh giá thất bại!", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-center">
          Đánh giá sản phẩm
        </h2>
        {/* Thông tin đơn hàng */}
        <div className="mb-4 text-sm text-gray-700">
          <div className="font-semibold mb-2">Sản phẩm trong đơn hàng:</div>
          <ul>
            {order.orderProducts?.map((item: any, idx: number) => (
              <li key={idx} className="flex items-center gap-3 mb-3">
                <img
                  src={item.Variant?.Product?.product_image}
                  alt={item.Variant?.Product?.product_name}
                  className="w-14 h-14 object-cover bg-gray-100 border"
                />
                <div>
                  <div className="font-bold">
                    {item.Variant?.Product?.product_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Loại: {item.Variant?.Product?.Category?.category_name} |
                    Màu: {item.Variant?.variant_color ?? "-"} | Size:{" "}
                    {item.Variant?.variant_size ?? "-"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Số lượng: {item.quantity} | Giá:{" "}
                    {Number(item.price_at_time).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* ...phần đánh giá giữ nguyên... */}
        <div className="mb-4 flex justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`cursor-pointer text-2xl ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          className="w-full border rounded p-2 mb-4"
          rows={3}
          placeholder="Nhận xét của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Hủy
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded font-semibold"
            onClick={handleSubmitReview}
          >
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
}
