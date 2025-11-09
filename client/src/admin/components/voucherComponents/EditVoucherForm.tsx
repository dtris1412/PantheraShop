import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { showToast } from "../../../shared/components/Toast";
import { useVoucher, Voucher } from "../../contexts/voucherContext";

interface EditVoucherFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  voucher: Voucher;
}

const EditVoucherForm = ({
  isOpen,
  onClose,
  onSuccess,
  voucher,
}: EditVoucherFormProps) => {
  const { updateVoucher } = useVoucher();

  const [formData, setFormData] = useState({
    voucher_code: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_value: 0,
    start_date: "",
    end_date: "",
    usage_limit: 1,
    voucher_status: "active" as string,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (voucher) {
      setFormData({
        voucher_code: voucher.voucher_code,
        discount_type: voucher.discount_type,
        discount_value: voucher.discount_value,
        min_order_value: voucher.min_order_value || 0,
        start_date: voucher.start_date.split("T")[0],
        end_date: voucher.end_date.split("T")[0],
        usage_limit: voucher.usage_limit,
        voucher_status: voucher.voucher_status,
      });
    }
  }, [voucher]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateVoucher(voucher.voucher_id, formData);
      showToast("Cập nhật voucher thành công!", "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating voucher:", error);
      showToast(error.message || "Có lỗi xảy ra khi cập nhật voucher", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              CHỈNH SỬA VOUCHER
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Cập nhật thông tin mã giảm giá
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          {/* Voucher Code */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              MÃ VOUCHER *
            </label>
            <input
              type="text"
              name="voucher_code"
              value={formData.voucher_code}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 uppercase"
              placeholder="SUMMER2024"
              required
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                LOẠI GIẢM GIÁ *
              </label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 bg-white"
                required
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (₫)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                GIÁ TRỊ GIẢM *
              </label>
              <input
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
                placeholder="10"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Min Order Value */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              GIÁ TRỊ ĐƠN HÀNG TỐI THIỂU (₫)
            </label>
            <input
              type="number"
              name="min_order_value"
              value={formData.min_order_value}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Để 0 nếu không yêu cầu giá trị đơn hàng tối thiểu
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                NGÀY BẮT ĐẦU *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                NGÀY KẾT THÚC *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
                required
              />
            </div>
          </div>

          {/* Usage Limit & Used Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                GIỚI HẠN SỬ DỤNG *
              </label>
              <input
                type="number"
                name="usage_limit"
                value={formData.usage_limit}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
                placeholder="1"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                ĐÃ SỬ DỤNG
              </label>
              <input
                type="text"
                value={voucher.used_count}
                className="w-full px-4 py-3 border-b-2 border-gray-300 bg-gray-50 text-gray-500"
                disabled
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              TRẠNG THÁI *
            </label>
            <select
              name="voucher_status"
              value={formData.voucher_status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 bg-white"
              required
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm dừng</option>
            </select>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 bg-white flex items-center justify-between gap-4 pt-8 border-t mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-black border-2 border-black hover:bg-black hover:text-white transition-all duration-200 font-medium uppercase tracking-wider"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-black text-white hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium uppercase tracking-wider"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVoucherForm;
