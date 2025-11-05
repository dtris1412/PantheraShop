import React from "react";
import { useSupplier, Supplier } from "../../contexts/supplierContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
}

const SupplierDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  supplier,
}) => {
  // Nếu muốn lấy dữ liệu mới nhất từ context, có thể fetch lại ở đây nếu cần
  // const { suppliers } = useSupplier();
  // const detail = suppliers.find(s => s.supplier_id === supplier.supplier_id) || supplier;

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        className="bg-white w-full max-w-lg p-8 border border-gray-200"
        style={{ borderRadius: 0 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Chi tiết nhà cung cấp
        </h2>
        <div className="space-y-4">
          <div>
            <span className="font-medium">Tên:</span> {supplier.supplier_name}
          </div>
          <div>
            <span className="font-medium">Số điện thoại:</span>{" "}
            {supplier.supplier_phone || "-"}
          </div>
          <div>
            <span className="font-medium">Email:</span>{" "}
            {supplier.supplier_email || "-"}
          </div>
          <div>
            <span className="font-medium">Địa chỉ:</span>{" "}
            {supplier.supplier_address || "-"}
          </div>
          <div>
            <span className="font-medium">Trạng thái:</span>{" "}
            {supplier.is_active ? "Đang liên kết" : "Đã hủy"}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button
            className="px-5 py-2 bg-black text-white hover:bg-gray-900 text-base font-medium"
            style={{ borderRadius: 0 }}
            type="button"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailModal;
