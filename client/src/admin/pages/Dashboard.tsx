import { useEffect, useState } from "react";
import { Users, ShoppingCart, Package, DollarSign } from "lucide-react";
import StatCard from "../components/StatCard";
import { useDashboard } from "../contexts/dashboardContext";
import { formatVND } from "../../utils/format";

const Dashboard = () => {
  const {
    stats,
    loading,
    error,
    fetchStats,
    fetchMonthlySales,
    recentOrders,
    fetchRecentOrders,
  } = useDashboard();
  const [monthlySalesData, setMonthlySalesData] = useState<
    { month: string; value: number }[]
  >([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  useEffect(() => {
    fetchStats();
    const year = new Date().getFullYear();
    fetchMonthlySales(year).then((sales) => {
      setMonthlySalesData(
        sales.map((item) => ({
          month: `T${item.month}`,
          value: item.value,
        }))
      );
    });
    fetchRecentOrders();
  }, []);

  const statList = [
    {
      title: "Khách hàng",
      value: stats?.users.value?.toLocaleString("vi-VN") ?? "0",
      icon: Users,
      trend: stats?.users.trend ?? { value: "0%", isPositive: true },
    },
    {
      title: "Đơn hàng",
      value: stats?.orders.value?.toLocaleString("vi-VN") ?? "0",
      icon: ShoppingCart,
      trend: stats?.orders.trend ?? { value: "0%", isPositive: true },
    },
    {
      title: "Sản phẩm",
      value: stats?.products.value?.toLocaleString("vi-VN") ?? "0",
      icon: Package,
      trend: stats?.products.trend ?? { value: "0%", isPositive: true },
    },
    {
      title: "Doanh thu",
      value: stats?.revenue.value
        ? formatVND(stats.revenue.value)
        : formatVND(0),
      icon: DollarSign,
      trend: stats?.revenue.trend ?? { value: "0%", isPositive: true },
    },
  ];

  const maxValue = Math.max(...monthlySalesData.map((d) => d.value), 1);

  // Tính điểm cho line chart
  const chartWidth = 1000;
  const chartHeight = 200;
  const points = monthlySalesData.map((d, i) => {
    const x = (chartWidth / (monthlySalesData.length - 1)) * i;
    const y = chartHeight - (d.value / maxValue) * chartHeight;
    return [x, y];
  });

  // Tạo đường path SVG từ các điểm
  const linePath =
    points.length > 0
      ? points
          .map((point, i) =>
            i === 0 ? `M ${point[0]} ${point[1]}` : `L ${point[0]} ${point[1]}`
          )
          .join(" ")
      : "";

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-black">Bảng điều khiển</h1>
        <p className="text-gray-600 mt-1">Chào mừng trở lại Panthera Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statList.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      {loading && <div>Đang tải dữ liệu...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {/* Biểu đồ doanh số theo tháng */}
      <div className="bg-white p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-black">Doanh số theo tháng</h2>
          <button className="text-gray-400 hover:text-black transition-colors duration-200">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
        <div className="relative h-64">
          {/* Bar chart */}
          <div className="absolute inset-0 flex items-end justify-between gap-2 z-10">
            {monthlySalesData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-black hover:bg-gray-700 transition-all duration-300 cursor-pointer relative group"
                  style={{
                    height: `${(data.value / maxValue) * 100}%`,
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {formatVND(data.value)}
                  </div>
                </div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
          {/* Line chart */}
          <svg
            className="absolute inset-0 w-full h-full z-20 pointer-events-none"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            <path d={linePath} fill="none" stroke="#000" strokeWidth="3" />
          </svg>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-black">Đơn hàng gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-3">Mã đơn</th>
                <th className="px-6 py-3">Khách hàng</th>
                <th className="px-6 py-3">Ngày</th>
                <th className="px-6 py-3">Số tiền</th>
                <th className="px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-black">
                      {order.order_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.recipient_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.order_date}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-black">
                      {formatVND(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium ${
                          order.order_status === "Hoàn thành"
                            ? "bg-green-100 text-green-800"
                            : order.order_status === "Đang xử lý"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không có đơn hàng gần đây
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
