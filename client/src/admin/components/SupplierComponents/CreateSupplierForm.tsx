import React, { useState } from "react";
import { useSupplier, Supplier } from "../../contexts/supplierContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: Partial<Supplier>) => Promise<void>; // optional, fallback to context
}

const CreateSupplierForm: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const { createSupplier } = useSupplier();
  const [form, setForm] = useState<Partial<Supplier>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (onSubmit) {
      await onSubmit(form);
    } else {
      await createSupplier(form);
    }
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        className="bg-white w-full max-w-lg p-8 border border-gray-200"
        style={{ borderRadius: 0 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Thêm nhà cung cấp
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-base font-medium mb-1">
              Tên nhà cung cấp
            </label>
            <input
              className="w-full border border-gray-300 px-4 py-2 text-base focus:outline-none focus:border-black bg-gray-50"
              style={{ borderRadius: 0 }}
              value={form.supplier_name || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, supplier_name: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-1">
              Số điện thoại
            </label>
            <input
              className="w-full border border-gray-300 px-4 py-2 text-base focus:outline-none focus:border-black bg-gray-50"
              style={{ borderRadius: 0 }}
              value={form.supplier_phone || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, supplier_phone: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-1">Email</label>
            <input
              className="w-full border border-gray-300 px-4 py-2 text-base focus:outline-none focus:border-black bg-gray-50"
              style={{ borderRadius: 0 }}
              value={form.supplier_email || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, supplier_email: e.target.value }))
              }
              type="email"
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-1">Địa chỉ</label>
            <input
              className="w-full border border-gray-300 px-4 py-2 text-base focus:outline-none focus:border-black bg-gray-50"
              style={{ borderRadius: 0 }}
              value={form.supplier_address || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, supplier_address: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-1">
              Loại đối tác
            </label>
            <select
              className="w-full border border-gray-300 px-4 py-2 text-base focus:outline-none focus:border-black bg-gray-50"
              style={{ borderRadius: 0 }}
              value={form.supplier_type || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, supplier_type: e.target.value }))
              }
              required
            >
              <option value="">Chọn loại đối tác</option>
              <option value="Nhà cung cấp">Nhà cung cấp</option>
              <option value="Đại lý">Đại lý</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button
              className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-base font-medium"
              style={{ borderRadius: 0 }}
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className="px-5 py-2 bg-black text-white hover:bg-gray-900 text-base font-medium disabled:opacity-50"
              style={{ borderRadius: 0 }}
              type="submit"
              disabled={loading || !form.supplier_name}
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupplierForm;
