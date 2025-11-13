import React, { useEffect, useState } from "react";
import { useSupplier, Supplier } from "../contexts/supplierContext";
import { Plus, Edit, Eye, XCircle, CheckCircle } from "lucide-react";
import CreateSupplierForm from "../components/SupplierComponents/CreateSupplierForm";
import EditSupplierForm from "../components/SupplierComponents/EditSupplierForm";
import SupplierDetailModal from "../components/SupplierComponents/SupplierDetailModal";
import { showToast } from "../../shared/components/Toast";

const SupplierList: React.FC = () => {
  const {
    suppliers,
    fetchSuppliers,
    fetchSuppliersPaginated,
    createSupplier,
    updateSupplier,
    setConnectionStatus,
  } = useSupplier();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );

  // Pagination state
  const [paginatedSuppliers, setPaginatedSuppliers] = useState<Supplier[]>([]);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPaginated, setLoadingPaginated] = useState(false);
  const itemsPerPage = 10;

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterStatus]);

  // Fetch paginated suppliers
  useEffect(() => {
    fetchSuppliersPaginatedData();
  }, [currentPage, debouncedSearch, filterType, filterStatus]);

  const fetchSuppliersPaginatedData = async () => {
    setLoadingPaginated(true);
    try {
      const result = await fetchSuppliersPaginated({
        search: debouncedSearch,
        supplier_type: filterType,
        is_connected: filterStatus,
        limit: itemsPerPage,
        page: currentPage,
      });
      if (result.success) {
        // Map is_connected to is_active for consistency
        const mapped = result.suppliers.map((s: any) => ({
          ...s,
          is_active: s.is_connected,
        }));
        setPaginatedSuppliers(mapped);
        setTotalSuppliers(result.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching paginated suppliers:", error);
    } finally {
      setLoadingPaginated(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Thống kê
  const total = suppliers.length;
  const active = suppliers.filter((s) => s.is_active).length;
  const inactive = total - active;

  // Pagination logic
  const totalPages = Math.ceil(totalSuppliers / itemsPerPage);

  const renderPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Quản lý nhà cung cấp
          </h1>
          <p className="text-gray-600 mt-1">
            Danh sách và thao tác với nhà cung cấp
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors duration-200 text-lg font-semibold"
          style={{ borderRadius: 0 }}
        >
          <Plus size={22} />
          <span>Thêm nhà cung cấp</span>
        </button>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="bg-white border border-gray-200 p-6 flex flex-col items-center"
          style={{ borderRadius: 0 }}
        >
          <div className="text-xs text-gray-500 uppercase mb-2">
            Tổng nhà cung cấp
          </div>
          <div className="text-3xl font-bold text-black">{total}</div>
        </div>
        <div
          className="bg-white border border-gray-200 p-6 flex flex-col items-center"
          style={{ borderRadius: 0 }}
        >
          <div className="text-xs text-gray-500 uppercase mb-2">
            Đang hoạt động
          </div>
          <div className="text-3xl font-bold text-green-600">{active}</div>
        </div>
        <div
          className="bg-white border border-gray-200 p-6 flex flex-col items-center"
          style={{ borderRadius: 0 }}
        >
          <div className="text-xs text-gray-500 uppercase mb-2">Đã hủy</div>
          <div className="text-3xl font-bold text-gray-500">{inactive}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tên, email, số điện thoại, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
              style={{ borderRadius: 0 }}
            />
          </div>

          {/* Filter by Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại nhà cung cấp
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
              style={{ borderRadius: 0 }}
            >
              <option value="">Tất cả</option>
              <option value="Manufacturer">Nhà sản xuất</option>
              <option value="Distributor">Nhà phân phối</option>
              <option value="Wholesaler">Nhà bán sỉ</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
              style={{ borderRadius: 0 }}
            >
              <option value="">Tất cả</option>
              <option value="true">Đang liên kết</option>
              <option value="false">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white border border-gray-200 overflow-hidden"
        style={{ borderRadius: 0 }}
      >
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              <th className="px-6 py-4">Tên nhà cung cấp</th>
              <th className="px-6 py-4">Số điện thoại</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Địa chỉ</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loadingPaginated ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">
                  Đang tải...
                </td>
              </tr>
            ) : paginatedSuppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">
                  Không có nhà cung cấp nào
                </td>
              </tr>
            ) : (
              paginatedSuppliers.map((s: Supplier) => (
                <tr
                  key={s.supplier_id}
                  className={`transition-colors duration-200 ${
                    s.is_active
                      ? "hover:bg-gray-50"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <td className="px-6 py-4 text-base font-medium text-black">
                    {s.supplier_name}
                  </td>
                  <td className="px-6 py-4 text-base">
                    {s.supplier_phone || "-"}
                  </td>
                  <td className="px-6 py-4 text-base">
                    {s.supplier_email || "-"}
                  </td>
                  <td className="px-6 py-4 text-base">
                    {s.supplier_address || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {Boolean(s.is_active) ? (
                      <span
                        className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800"
                        style={{ borderRadius: 0 }}
                      >
                        Đang liên kết
                      </span>
                    ) : (
                      <span
                        className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600"
                        style={{ borderRadius: 0 }}
                      >
                        Đã hủy
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSupplier(s);
                          setShowDetailModal(true);
                        }}
                        className="p-2 hover:bg-blue-50 transition-colors"
                        style={{ borderRadius: 0 }}
                        title="Xem chi tiết"
                        // Nếu muốn disable luôn xem chi tiết thì thêm disabled={!s.is_active}
                      >
                        <Eye size={18} className="text-blue-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSupplier(s);
                          setShowEditModal(true);
                        }}
                        className={`p-2 hover:bg-gray-100 transition-colors ${
                          !s.is_active ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        style={{ borderRadius: 0 }}
                        title="Chỉnh sửa"
                        disabled={!s.is_active}
                      >
                        <Edit size={18} className="text-gray-600" />
                      </button>
                      {s.is_active ? (
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              window.confirm(
                                "Bạn chắc chắn muốn hủy liên kết nhà cung cấp này? Sau khi hủy sẽ không thể mở lại."
                              )
                            ) {
                              await setConnectionStatus(s.supplier_id, false);
                              fetchSuppliersPaginatedData(); // Refresh paginated list
                              showToast(
                                "Đã hủy liên kết nhà cung cấp!",
                                "success"
                              );
                            }
                          }}
                          className="p-2 hover:bg-red-50 transition-colors"
                          style={{ borderRadius: 0 }}
                          title="Hủy liên kết"
                        >
                          <XCircle size={18} className="text-red-600" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await setConnectionStatus(s.supplier_id, true);
                            fetchSuppliersPaginatedData(); // Refresh paginated list
                            showToast(
                              "Đã khôi phục liên kết nhà cung cấp!",
                              "success"
                            );
                          }}
                          className="p-2 hover:bg-green-50 transition-colors"
                          style={{ borderRadius: 0 }}
                          title="Khôi phục liên kết"
                        >
                          <CheckCircle size={18} className="text-green-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm text-gray-700 disabled:text-gray-300 hover:text-black disabled:cursor-not-allowed"
          >
            Trước
          </button>

          {renderPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page as number)}
                className={`px-4 py-2 text-sm ${
                  currentPage === page
                    ? "text-black font-bold underline"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm text-gray-700 disabled:text-gray-300 hover:text-black disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}

      {/* Modal Create */}
      {showCreateModal && (
        <CreateSupplierForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            await createSupplier(data);
            setShowCreateModal(false);
            fetchSuppliersPaginatedData(); // Refresh paginated list
            showToast("Thêm nhà cung cấp thành công!", "success");
          }}
        />
      )}
      {/* Modal Edit */}
      {showEditModal && selectedSupplier && (
        <EditSupplierForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSupplier(null);
          }}
          onSubmit={async (data) => {
            await updateSupplier(selectedSupplier.supplier_id, data);
            setShowEditModal(false);
            setSelectedSupplier(null);
            fetchSuppliersPaginatedData(); // Refresh paginated list
            showToast("Cập nhật nhà cung cấp thành công!", "success");
          }}
          initialData={selectedSupplier}
        />
      )}
      {/* Modal Detail */}
      {showDetailModal && selectedSupplier && (
        <SupplierDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSupplier(null);
          }}
          supplier={selectedSupplier}
        />
      )}
    </div>
  );
};

export default SupplierList;
