import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "../contexts/orderContext";
import { showToast } from "../../shared/components/Toast";

interface User {
  user_id: number;
  user_name: string;
  user_email: string;
}

interface Order {
  order_id: number;
  user_id: number;
  order_status: string;
  total_amount: number;
  order_date: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  payment_method?: string;
  payment_status?: string;
  orderProducts?: any[];
  User?: User;
}

const statusOptions = [
  "Tất cả",
  "Chờ xác nhận",
  "Đang xử lý",
  "Đang vận chuyển",
  "Đã giao",
  "Đã hủy",
];

const statusColors: Record<string, string> = {
  "Chờ xác nhận": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Đang xử lý": "bg-blue-100 text-blue-800 border-blue-300",
  "Đang vận chuyển": "bg-purple-100 text-purple-800 border-purple-300",
  "Đã giao": "bg-green-100 text-green-800 border-green-300",
  "Đã hủy": "bg-red-100 text-red-800 border-red-300",
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Processing: "bg-blue-100 text-blue-800 border-blue-300",
  Shipped: "bg-purple-100 text-purple-800 border-purple-300",
  Delivered: "bg-green-100 text-green-800 border-green-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
};

function formatVND(value: number | string) {
  return Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const OrderList = () => {
  const navigate = useNavigate();
  const { getAllOrders, loading } = useOrder();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateSort, setDateSort] = useState<"" | "desc" | "asc">("desc");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast("Không thể tải danh sách đơn hàng", "error");
    }
  };

  // Lọc và tìm kiếm
  let filtered = orders;

  // Lọc theo trạng thái
  if (statusFilter !== "Tất cả") {
    filtered = filtered.filter((o) => o.order_status === statusFilter);
  }

  // Tìm kiếm theo mã đơn, tên người nhận, SĐT
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.order_id.toString().includes(query) ||
        o.recipient_name?.toLowerCase().includes(query) ||
        o.recipient_phone?.includes(query)
    );
  }

  // Sắp xếp theo ngày
  if (dateSort) {
    filtered = [...filtered].sort((a, b) => {
      return dateSort === "desc"
        ? new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
        : new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
    });
  }

  const handleViewDetail = (order: Order) => {
    navigate(`/admin/orders/${order.order_id}`, { state: { order } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8">Quản lý đơn hàng</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo mã đơn, tên, SĐT..."
              className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Date Sort */}
          <div>
            <select
              value={dateSort}
              onChange={(e) =>
                setDateSort(e.target.value as "desc" | "asc" | "")
              }
              className="border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">-- Sắp xếp --</option>
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white border rounded-lg">
            <p className="text-gray-600">Không tìm thấy đơn hàng nào.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((order) => (
              <div
                key={order.order_id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-lg">
                      #{order.order_id.toString().substring(0, 8)}
                    </h3>
                    <span
                      className={`px-3 py-1  text-sm font-semibold  ${
                        statusColors[order.order_status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {formatVND(order.total_amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Đã đặt vào{" "}
                      {new Date(order.order_date).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  {/* Customer Info */}
                  <div className="flex gap-8 mb-4">
                    {/* User Info bên trái */}
                    <div className="flex-1 pr-8 border-r border-gray-300">
                      <div className="font-semibold text-gray-700 mb-2">
                        Thông tin User:
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium">ID:</span>{" "}
                          {order.User?.user_id}
                        </div>
                        <div>
                          <span className="font-medium">Tên:</span>{" "}
                          {order.User?.user_name}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>{" "}
                          {order.User?.user_email}
                        </div>
                      </div>
                    </div>
                    {/* Recipient Info bên phải */}
                    <div className="flex-1 pl-8">
                      <div className="font-semibold text-gray-700 mb-2">
                        Thông tin người nhận:
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium">Tên:</span>{" "}
                          {order.recipient_name}
                        </div>
                        <div>
                          <span className="font-medium">SĐT:</span>{" "}
                          {order.recipient_phone}
                        </div>
                        <div>
                          <span className="font-medium">Địa chỉ:</span>{" "}
                          {order.recipient_address}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  {order.orderProducts && order.orderProducts.length > 0 && (
                    <div className="space-y-3">
                      {order.orderProducts.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 pb-3 border-b last:border-b-0"
                        >
                          <img
                            src={
                              item.Variant?.Product?.product_image ||
                              "/placeholder.jpg"
                            }
                            alt={item.Variant?.Product?.product_name}
                            className="w-20 h-20 object-cover bg-gray-100 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-semibold">
                              {item.Variant?.Product?.product_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Size: {item.Variant?.variant_size || "-"} | Màu:{" "}
                              {item.Variant?.variant_color || "-"} | SL:{" "}
                              {item.quantity}
                            </div>
                          </div>
                          <div className="text-right font-semibold">
                            {formatVND(item.price_at_time)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-6 pt-4 border-t">
                    <button
                      onClick={() => handleViewDetail(order)}
                      className="flex-1 px-6 py-3 bg-white border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
