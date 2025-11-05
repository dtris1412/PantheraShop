import { X, Edit, Trash2, Package } from "lucide-react";
import { Variant } from "../../contexts/inventoryContext";

interface VariantDetailModalProps {
  isOpen: boolean;
  variant: Variant | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const VariantDetailModal = ({
  isOpen,
  variant,
  onClose,
  onEdit,
  onDelete,
}: VariantDetailModalProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { label: "Hết hàng", color: "bg-red-100 text-red-800" };
    } else if (stock < 20) {
      return { label: "Sắp hết", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "Còn hàng", color: "bg-green-100 text-green-800" };
    }
  };

  if (!isOpen || !variant) return null;

  const stockStatus = getStockStatus(variant.variant_stock);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Nike Style */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
          <h2 className="text-sm uppercase tracking-wider font-medium">
            CHI TIẾT BIẾN THỂ
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Chỉnh sửa"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Xóa"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left: Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-50 overflow-hidden">
                {variant.product_image ? (
                  <img
                    src={variant.product_image}
                    alt={variant.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <Package size={80} strokeWidth={1} />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Variant Info */}
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                  SẢN PHẨM
                </div>
                <h1 className="text-2xl font-medium">
                  {variant.product_name || "Không có tên"}
                </h1>
              </div>

              {/* Variant Details */}
              <div className="space-y-4 pb-6 border-b">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    KÍCH CỠ
                  </div>
                  <div className="font-medium text-lg">
                    {variant.variant_size || "Standard"}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    MÀU SẮC
                  </div>
                  <div className="font-medium text-lg">
                    {variant.variant_color || "Default"}
                  </div>
                </div>
              </div>

              {/* Stock Info */}
              <div className="space-y-4 pb-6 border-b">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                    SỐ LƯỢNG TỒN KHO
                  </div>
                  <div className="text-3xl font-medium">
                    {variant.variant_stock}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs uppercase tracking-wider text-gray-500">
                    TRẠNG THÁI
                  </div>
                  <span
                    className={`px-3 py-1 text-xs uppercase tracking-wider font-medium ${stockStatus.color}`}
                  >
                    {stockStatus.label}
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    MÃ BIẾN THỂ
                  </div>
                  <div className="text-sm font-mono text-gray-600">
                    #{variant.variant_id}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                    NGÀY TẠO
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(variant.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantDetailModal;
