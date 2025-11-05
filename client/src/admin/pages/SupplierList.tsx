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
    loading,
    fetchSuppliers,
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

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Thống kê
  const total = suppliers.length;
  const active = suppliers.filter((s) => s.is_active).length;
  const inactive = total - active;

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
            {suppliers.map((s: Supplier) => (
              <tr
                key={s.supplier_id}
                className={`transition-colors duration-200 ${
                  s.is_active ? "hover:bg-gray-50" : "bg-gray-50 text-gray-400"
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
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">
                  Không có nhà cung cấp nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Create */}
      {showCreateModal && (
        <CreateSupplierForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            await createSupplier(data);
            setShowCreateModal(false);
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
