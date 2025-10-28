import { Package, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const InventoryList = () => {
  const inventoryStats = [
    {
      title: "Tổng sản phẩm",
      value: "1,234",
      icon: Package,
      trend: { value: "5.2%", isPositive: true },
    },
    {
      title: "Sắp hết hàng",
      value: "23",
      icon: TrendingDown,
      trend: { value: "3", isPositive: false },
    },
    {
      title: "Hết hàng",
      value: "5",
      icon: TrendingDown,
      trend: { value: "2", isPositive: false },
    },
    {
      title: "Giá trị kho",
      value: "2.3 tỷ",
      icon: DollarSign,
      trend: { value: "8.5%", isPositive: true },
    },
  ];

  const inventoryData = [
    {
      id: 1,
      productName: "Nike Air Max 2024",
      sku: "NAM-2024-001",
      category: "Giày chạy",
      stock: 150,
      minStock: 50,
      price: "3,500,000đ",
      status: "in-stock",
    },
    {
      id: 2,
      productName: "Adidas Ultraboost",
      sku: "ADB-UB-002",
      category: "Giày chạy",
      stock: 25,
      minStock: 50,
      price: "4,200,000đ",
      status: "low-stock",
    },
    {
      id: 3,
      productName: "Puma Speed 600",
      sku: "PUM-S6-003",
      category: "Giày chạy",
      stock: 0,
      minStock: 30,
      price: "2,800,000đ",
      status: "out-of-stock",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Quản lý kho</h1>
        <p className="text-gray-600 mt-1">Theo dõi tồn kho và cảnh báo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {inventoryStats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white p-6 border border-gray-200 hover:border-black transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                <stat.icon size={24} className="text-gray-600" />
              </div>
              {stat.trend && (
                <span
                  className={`text-sm font-medium ${
                    stat.trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend.isPositive ? "↑" : "↓"} {stat.trend.value}
                </span>
              )}
            </div>
            <h3 className="text-sm text-gray-600 mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-black">Danh sách tồn kho</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Tồn kho</th>
                <th className="px-6 py-4">Giá</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventoryData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-black">
                      {item.productName}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.category}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          item.status === "out-of-stock"
                            ? "text-red-600"
                            : item.status === "low-stock"
                            ? "text-yellow-600"
                            : "text-black"
                        }`}
                      >
                        {item.stock}
                      </span>
                      <span className="text-xs text-gray-400">
                        / {item.minStock}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-black">
                    {item.price}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium ${
                        item.status === "in-stock"
                          ? "bg-green-100 text-green-800"
                          : item.status === "low-stock"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status === "in-stock"
                        ? "Còn hàng"
                        : item.status === "low-stock"
                        ? "Sắp hết"
                        : "Hết hàng"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
