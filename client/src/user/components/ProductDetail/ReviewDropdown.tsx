import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ReviewDropdown({
  reviews,
  averageRating,
}: {
  reviews: {
    rating: number;
    comment: string;
    user_name?: string;
    created_at?: string;
  }[];
  averageRating: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-b py-6 mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-2xl font-semibold">
          Đánh giá ({reviews.length})
        </span>
        <div className="flex items-center gap-2">
          <RatingStars rating={averageRating} />
          <ChevronDown
            className={`w-6 h-6 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>
      {open && (
        <div className="mt-6 space-y-6">
          {reviews.length === 0 && (
            <div className="text-gray-500">Chưa có đánh giá nào.</div>
          )}
          {reviews.map((r, idx) => (
            <div key={idx} className="border-b pb-4">
              <div className="flex items-center gap-2 mb-1">
                <RatingStars rating={r.rating} />
                <span className="text-xs text-gray-400">
                  {r.user_name || "Ẩn danh"}
                </span>
                {r.created_at && (
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString("vi-VN")}
                  </span>
                )}
              </div>
              <div className="text-gray-700">{r.comment}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Component hiển thị sao
function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <span className="flex text-xl text-yellow-500">
      {[...Array(fullStars)].map((_, i) => (
        <span key={i}>★</span>
      ))}
      {hasHalfStar && (
        <span key="half" className="text-yellow-400">
          ★
        </span>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={i + fullStars + 1} className="text-gray-300">
          ★
        </span>
      ))}
    </span>
  );
}
