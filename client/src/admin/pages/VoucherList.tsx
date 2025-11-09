import { useState, useEffect } from "react";
import { Plus, Search, Calendar, Tag, TrendingUp, Edit2 } from "lucide-react";
import { useVoucher, Voucher } from "../contexts/voucherContext";
import CreateVoucherForm from "../components/voucherComponents/CreateVoucherForm";
import EditVoucherForm from "../components/voucherComponents/EditVoucherForm";
import { formatVND } from "../../utils/format";

const VoucherList = () => {
  const { vouchers, getAllVouchers, loading } = useVoucher();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      await getAllVouchers();
      // Sau đó lấy dữ liệu từ vouchers trong context
    } catch (error) {
      console.error("Error loading vouchers:", error);
    }
  };

  const handleCreateSuccess = () => {
    loadVouchers();
    setIsCreateModalOpen(false);
  };

  const handleEditSuccess = () => {
    loadVouchers();
    setEditVoucher(null);
  };

  // Filter vouchers
  const filteredVouchers = (vouchers || []).filter((voucher) => {
    const matchesSearch = voucher.voucher_code
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && voucher.voucher_status) ||
      (statusFilter === "inactive" && !voucher.voucher_status);

    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Format discount
  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discount_type === "percentage") {
      return `${voucher.discount_value}%`;
    }
    return formatVND(voucher.discount_value);
  };

  // Check if voucher is expired
  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  // Check if voucher hasn't started yet
  const isNotStarted = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  // Calculate usage percentage
  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              QUẢN LÝ VOUCHER
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý mã giảm giá cho cửa hàng
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-all duration-200 font-semibold uppercase tracking-wider"
          >
            <Plus size={20} />
            Tạo Voucher
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã voucher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang tải vouchers...</p>
        </div>
      )}

      {/* Vouchers Grid */}
      {!loading && filteredVouchers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => {
            const expired = isExpired(voucher.end_date);
            const notStarted = isNotStarted(voucher.start_date);
            const usagePercent = getUsagePercentage(
              voucher.used_count,
              voucher.usage_limit
            );
            const isFullyUsed = voucher.used_count >= voucher.usage_limit;

            return (
              <div
                key={voucher.voucher_id}
                className="bg-white border-2 border-gray-200 hover:border-black transition-all duration-300 p-6 relative group"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {expired && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                      HẾT HẠN
                    </span>
                  )}
                  {!expired && isFullyUsed && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
                      HẾT LƯỢT
                    </span>
                  )}
                  {!expired &&
                    !isFullyUsed &&
                    voucher.voucher_status === "inactive" && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">
                        ĐÃ NGƯNG
                      </span>
                    )}
                  {!expired &&
                    !isFullyUsed &&
                    notStarted &&
                    voucher.voucher_status && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                        CHƯA ĐẾN NGÀY
                      </span>
                    )}
                  {!expired &&
                    !isFullyUsed &&
                    !notStarted &&
                    voucher.voucher_status === "active" && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                        HOẠT ĐỘNG
                      </span>
                    )}
                </div>

                {/* Voucher Code */}
                <div className="mb-4 pr-20">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="text-gray-600" size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Mã voucher
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight break-all">
                    {voucher.voucher_code}
                  </h3>
                </div>

                {/* Discount Info */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-gray-600" size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Giảm giá
                    </span>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {formatDiscount(voucher)}
                  </p>
                  {voucher.min_order_value > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Đơn tối thiểu: {formatVND(voucher.min_order_value)}
                    </p>
                  )}
                </div>

                {/* Date Range */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-gray-600" size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Thời gian
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {formatDate(voucher.start_date)} -{" "}
                    {formatDate(voucher.end_date)}
                  </p>
                </div>

                {/* Usage Stats */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Đã sử dụng
                    </span>
                    <span className="text-sm font-semibold">
                      {voucher.used_count} / {voucher.usage_limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2">
                    <div
                      className={`h-2 transition-all duration-300 ${
                        usagePercent >= 100
                          ? "bg-red-500"
                          : usagePercent >= 80
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setEditVoucher(voucher)}
                  className="absolute bottom-6 right-6 p-2 bg-black text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-800"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredVouchers.length === 0 && (
        <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300">
          <Tag className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Không tìm thấy voucher
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== "all"
              ? "Thử thay đổi bộ lọc hoặc tạo voucher mới"
              : "Chưa có voucher nào. Tạo voucher đầu tiên ngay!"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-all duration-200 font-semibold uppercase tracking-wider"
            >
              Tạo Voucher Đầu Tiên
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateVoucherForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {editVoucher && (
        <EditVoucherForm
          isOpen={!!editVoucher}
          onClose={() => setEditVoucher(null)}
          onSuccess={handleEditSuccess}
          voucher={editVoucher}
        />
      )}
    </div>
  );
};

export default VoucherList;
