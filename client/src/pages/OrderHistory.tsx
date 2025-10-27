import { useOrderHistory } from "../contexts/OrderHistoryContext";
import OrderCard from "../components/order_history/OrderCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type Order = {
  order_id: string;
  order_status: string;
  total_amount: number | string;
  order_date: string;
  [key: string]: any;
};

const statusOptions = ["All", "Delivered", "Cancelled"];

function formatVND(value: number | string) {
  return Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function OrderHistory() {
  const { orders, loading } = useOrderHistory();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("All");
  const [priceSort, setPriceSort] = useState<"" | "desc" | "asc">("");
  const [dateSort, setDateSort] = useState<"" | "desc" | "asc">("desc");

  // Lọc theo trạng thái
  let filtered = orders;
  if (statusFilter !== "All") {
    filtered = filtered.filter((o: Order) => o.order_status === statusFilter);
  }

  // Sắp xếp theo tiêu chí đang chọn
  if (priceSort) {
    filtered = [...filtered].sort((a: Order, b: Order) => {
      const priceA = Number(a.total_amount);
      const priceB = Number(b.total_amount);
      return priceSort === "desc" ? priceB - priceA : priceA - priceB;
    });
  } else if (dateSort) {
    filtered = [...filtered].sort((a: Order, b: Order) => {
      return dateSort === "desc"
        ? new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
        : new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
    });
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Order History</h1>

        {/* Bộ lọc */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div>
            <label className="font-semibold mr-2">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold mr-2">Giá:</label>
            <select
              value={priceSort}
              onChange={(e) => {
                setPriceSort(e.target.value as "desc" | "asc" | "");
                setDateSort(""); // Vô hiệu hóa sort ngày khi chọn giá
              }}
              className="border px-2 py-1 rounded"
            >
              <option value="">-- Chọn --</option>
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>
          <div>
            <label className="font-semibold mr-2">Ngày:</label>
            <select
              value={dateSort}
              onChange={(e) => {
                setDateSort(e.target.value as "desc" | "asc" | "");
                setPriceSort(""); // Vô hiệu hóa sort giá khi chọn ngày
              }}
              className="border px-2 py-1 rounded"
            >
              <option value="">-- Chọn --</option>
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">No orders found.</div>
        ) : (
          <div className="space-y-8">
            {filtered.map((order: Order) => (
              <OrderCard key={order.order_id} order={order as any} />
            ))}
          </div>
        )}
        <button
          className="mt-8 px-4 py-2 bg-black text-white rounded"
          onClick={() => navigate("/profile")}
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}
