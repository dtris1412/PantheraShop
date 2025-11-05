import React, { useEffect, useState } from "react";
import ImportExcelModal from "../components/InventoryComponents/ImportExcelModal";
import { useInventory, Variant } from "../contexts/inventoryContext";
import { Package, Plus, ChevronDown, ChevronUp, Eye, Edit } from "lucide-react";
import { showToast } from "../../shared/components/Toast";
import CreateVariantForm from "../components/InventoryComponents/CreateVariantForm";
import EditVariantForm from "../components/InventoryComponents/EditVariantForm";
import VariantDetailModal from "../components/InventoryComponents/VariantDetailModal";
import ConfirmDialog from "../components/ConfirmDialog";

const getStockStatus = (stock: number) => {
  if (stock === 0) {
    return { label: "Hết hàng", color: "bg-red-100 text-red-800" };
  } else if (stock < 20) {
    return { label: "Sắp hết", color: "bg-yellow-100 text-yellow-800" };
  } else {
    return { label: "Còn hàng", color: "bg-green-100 text-green-800" };
  }
};

const InventoryList = () => {
  const { products, fetchProducts } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  // Đã chuyển selectedSupplier, importFile vào ImportExcelModal
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchProducts();
    } catch (error) {
      showToast("Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (product_id: number) => {
    setExpandedProductId(expandedProductId === product_id ? null : product_id);
  };

  // Filter products by search term
  const filteredProducts = products.filter((product: any) => {
    if (!searchTerm) return true;
    return (
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(product.Variant)
        ? product.Variant.some(
            (v: any) =>
              v.variant_size
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              v.variant_color?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : product.Variant &&
          (product.Variant.variant_size
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            product.Variant.variant_color
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())))
    );
  });

  // Calculate stats
  const totalProducts = products.length;
  const allVariants = products.flatMap((p) =>
    Array.isArray(p.Variant) ? p.Variant : p.Variant ? [p.Variant] : []
  );
  const totalVariants = allVariants.length;
  const inStock = allVariants.filter((v) => v.variant_stock >= 20).length;
  const lowStock = allVariants.filter(
    (v) => v.variant_stock > 0 && v.variant_stock < 20
  ).length;
  const outOfStock = allVariants.filter((v) => v.variant_stock === 0).length;

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-black">Quản lý kho</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tồn kho và biến thể sản phẩm
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black text-black hover:bg-gray-100 transition-colors duration-200"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 3v12m0 0l-4-4m4 4l4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="4"
                y="17"
                width="16"
                height="4"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span className="font-medium">Import Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white hover:bg-gray-800 transition-colors duration-200"
          >
            <Plus size={20} />
            <span className="font-medium">Thêm biến thể</span>
          </button>
        </div>
      </div>
      {/* Import Excel Modal */}
      <ImportExcelModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 border border-gray-200 hover:border-black transition-all duration-300">
          <h3 className="text-sm text-gray-600 mb-1">Tổng sản phẩm</h3>
          <p className="text-3xl font-bold text-black">{totalProducts}</p>
        </div>
        <div className="bg-white p-6 border border-gray-200 hover:border-black transition-all duration-300">
          <h3 className="text-sm text-gray-600 mb-1">Tổng biến thể</h3>
          <p className="text-3xl font-bold text-black">{totalVariants}</p>
        </div>
        <div className="bg-white p-6 border border-gray-200 hover:border-black transition-all duration-300">
          <h3 className="text-sm text-gray-600 mb-1">Còn hàng</h3>
          <p className="text-3xl font-bold text-green-600">{inStock}</p>
        </div>
        <div className="bg-white p-6 border border-gray-200 hover:border-black transition-all duration-300">
          <h3 className="text-sm text-gray-600 mb-1">Sắp hết</h3>
          <p className="text-3xl font-bold text-yellow-600">{lowStock}</p>
        </div>
        <div className="bg-white p-6 border border-gray-200 hover:border-black transition-all duration-300">
          <h3 className="text-sm text-gray-600 mb-1">Hết hàng</h3>
          <p className="text-3xl font-bold text-red-600">{outOfStock}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 border border-gray-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 relative min-w-80">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, size, màu sắc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              <th className="px-6 py-4">Sản phẩm</th>
              <th className="px-6 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentProducts.map((product: any) => (
              <React.Fragment key={product.product_id}>
                <tr className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.product_image ? (
                        <img
                          src={product.product_image}
                          alt={product.product_name}
                          className="w-12 h-12 object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-black">
                          {product.product_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.product_description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleExpand(product.product_id)}
                      className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      {expandedProductId === product.product_id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                      <span className="text-sm font-medium">
                        {expandedProductId === product.product_id
                          ? "Ẩn biến thể"
                          : "Xem biến thể"}
                      </span>
                    </button>
                  </td>
                </tr>
                {/* Dropdown for variants */}
                {expandedProductId === product.product_id && (
                  <tr>
                    <td colSpan={2} className="bg-gray-50 px-6 py-4">
                      {Array.isArray(product.Variant) ? (
                        product.Variant.length > 0 ? (
                          <table className="w-full border border-gray-200">
                            <thead className="bg-gray-100">
                              <tr className="text-left text-xs font-medium text-gray-600 uppercase">
                                <th className="px-4 py-3">Size</th>
                                <th className="px-4 py-3">Màu</th>
                                <th className="px-4 py-3">Tồn kho</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3">Thao tác</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {product.Variant.map((variant: any) => {
                                const stockStatus = getStockStatus(
                                  variant.variant_stock
                                );
                                const variantWithProductInfo = {
                                  ...variant,
                                  product_name: product.product_name,
                                  product_image: product.product_image,
                                };
                                return (
                                  <tr
                                    key={variant.variant_id}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-4 py-3 text-sm font-medium text-black">
                                      {variant.variant_size || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {variant.variant_color || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold">
                                      {variant.variant_stock}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={`px-3 py-1 text-xs font-medium rounded ${stockStatus.color}`}
                                      >
                                        {stockStatus.label}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedVariant(
                                              variantWithProductInfo
                                            );
                                            setShowDetailModal(true);
                                          }}
                                          className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                                          title="Xem chi tiết"
                                        >
                                          <Eye
                                            size={16}
                                            className="text-blue-600"
                                          />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedVariant(
                                              variantWithProductInfo
                                            );
                                            setShowEditModal(true);
                                          }}
                                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                          title="Chỉnh sửa"
                                        >
                                          <Edit
                                            size={16}
                                            className="text-gray-600"
                                          />
                                        </button>
                                        {/* Nút xóa bị ẩn do ràng buộc đơn hàng */}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-gray-400">
                            Không có biến thể nào
                          </div>
                        )
                      ) : product.Variant ? (
                        <div>
                          <span>Size: {product.Variant.variant_size}</span>
                          <span>Màu: {product.Variant.variant_color}</span>
                          <span>Tồn kho: {product.Variant.variant_stock}</span>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          Không có biến thể nào
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border border-gray-200">
          <div className="text-sm text-gray-600">
            Hiển thị {startIndex + 1} -{" "}
            {Math.min(endIndex, filteredProducts.length)} trong số{" "}
            {filteredProducts.length} sản phẩm
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 border transition-colors duration-200 ${
                  currentPage === page
                    ? "bg-black text-white border-black"
                    : "border-gray-300 bg-white hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Create Variant Modal */}
      {showCreateModal && (
        <CreateVariantForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchData}
        />
      )}

      {/* Edit Variant Modal */}
      {showEditModal && selectedVariant && (
        <EditVariantForm
          isOpen={showEditModal}
          variant={selectedVariant}
          onClose={() => {
            setShowEditModal(false);
            setSelectedVariant(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {/* Variant Detail Modal */}
      {showDetailModal && selectedVariant && (
        <VariantDetailModal
          isOpen={showDetailModal}
          variant={selectedVariant}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedVariant(null);
          }}
          onEdit={() => setShowEditModal(true)}
          onDelete={() => {}}
        />
      )}

      {/* Không còn dialog xác nhận xóa biến thể */}
    </div>
  );
};

export default InventoryList;
