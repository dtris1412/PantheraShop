import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { showToast } from "../../../shared/components/Toast";
import { useInventory, Variant } from "../../contexts/inventoryContext";

interface EditVariantFormProps {
  isOpen: boolean;
  variant: Variant | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditVariantForm = ({
  isOpen,
  variant,
  onClose,
  onSuccess,
}: EditVariantFormProps) => {
  const { updateVariant } = useInventory();

  const [formData, setFormData] = useState({
    variant_size: "",
    variant_color: "",
    variant_stock: "0",
  });

  const [loading, setLoading] = useState(false);

  // Load variant data when modal opens
  useEffect(() => {
    if (variant && isOpen) {
      setFormData({
        variant_size: variant.variant_size || "",
        variant_color: variant.variant_color || "",
        variant_stock: variant.variant_stock?.toString() || "0",
      });
    }
  }, [variant, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variant) return;

    setLoading(true);

    try {
      // Validate: at least size or color must be filled
      if (!formData.variant_size.trim() && !formData.variant_color.trim()) {
        showToast("Vui lòng nhập ít nhất kích cỡ hoặc màu sắc", "error");
        setLoading(false);
        return;
      }

      const variantData = {
        variant_size: formData.variant_size.trim() || "Standard",
        variant_color: formData.variant_color.trim() || "Default",
        variant_stock: parseInt(formData.variant_stock),
        product_id: variant.product_id,
      };

      await updateVariant(variant.variant_id, variantData);
      showToast("Cập nhật biến thể thành công!", "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating variant:", error);
      showToast(
        error.message || "Có lỗi xảy ra khi cập nhật biến thể",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !variant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              CẬP NHẬT BIẾN THỂ
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Chỉnh sửa thông tin biến thể sản phẩm
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
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
          {/* Product Info (Read-only) */}
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              SẢN PHẨM
            </p>
            <p className="text-lg font-medium">{variant.product_name}</p>
          </div>

          {/* Variant Details */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider">
              THÔNG TIN BIẾN THỂ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                  KÍCH CỠ{" "}
                  <span className="text-gray-400 font-normal normal-case">
                    (tùy chọn)
                  </span>
                </label>
                <input
                  type="text"
                  name="variant_size"
                  value={formData.variant_size}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
                  placeholder="S, M, L, XL..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                  MÀU SẮC{" "}
                  <span className="text-gray-400 font-normal normal-case">
                    (tùy chọn)
                  </span>
                </label>
                <input
                  type="text"
                  name="variant_color"
                  value={formData.variant_color}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200"
                  placeholder="Đỏ, Xanh, Vàng..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                SỐ LƯỢNG TỒN KHO *
              </label>
              <input
                type="number"
                name="variant_stock"
                value={formData.variant_stock}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-black focus:outline-none transition-colors duration-200 text-lg"
                placeholder="0"
                min="0"
                required
              />
            </div>
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
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang cập nhật...
                </span>
              ) : (
                "Cập nhật biến thể"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVariantForm;
