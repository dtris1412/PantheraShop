import React, { useEffect, useState, useCallback } from "react";
import ImportExcelModal from "../components/InventoryComponents/ImportExcelModal";
import { useInventory, Variant } from "../contexts/inventoryContext";
import { Package, Plus, ChevronDown, ChevronUp, Eye, Edit } from "lucide-react";
import { showToast } from "../../shared/components/Toast";
import CreateVariantForm from "../components/InventoryComponents/CreateVariantForm";
import EditVariantForm from "../components/InventoryComponents/EditVariantForm";
import VariantDetailModal from "../components/InventoryComponents/VariantDetailModal";

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
  const { getInventoryPaginated } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [allVariants, setAllVariants] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalVariants, setTotalVariants] = useState(0);
  const itemsPerPage = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch inventory with pagination
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getInventoryPaginated(
        debouncedSearch,
        itemsPerPage,
        currentPage
      );

      // Group variants by product
      const variantsData = result.products || [];
      const productMap = new Map<number | string, any>();

      variantsData.forEach((variant: any) => {
        const productId = variant.Product?.product_id || variant.product_id;

        if (!productMap.has(productId)) {
          productMap.set(productId, {
            product_id: productId,
            product_name: variant.Product?.product_name || "",
            product_description: variant.Product?.product_description || "",
            product_price: variant.Product?.product_price || 0,
            product_image: variant.Product?.product_image || "",
            created_at: variant.Product?.created_at || "",
            is_active: variant.Product?.is_active ?? true,
            Variant: [],
          });
        }

        const product = productMap.get(productId)!;
        if (Array.isArray(product.Variant)) {
          // Chỉ push variant nếu variant_id không null (sản phẩm có variant)
          if (variant.variant_id !== null) {
            product.Variant.push({
              variant_id: variant.variant_id,
              variant_size: variant.variant_size,
              variant_color: variant.variant_color,
              variant_stock: variant.variant_stock,
              product_id: productId,
              product_name: variant.Product?.product_name,
              product_image: variant.Product?.product_image,
              created_at: variant.created_at,
              updated_at: variant.updated_at,
            });
          }
          // Nếu variant_id === null, product.Variant sẽ là [] (rỗng)
        }
      });

      const productsArray = Array.from(productMap.values());
      setProducts(productsArray);

      // Flatten all variants for stats (chỉ dùng để hiển thị trên trang hiện tại)
      const allVars = productsArray.flatMap((p) =>
        Array.isArray(p.Variant) ? p.Variant : p.Variant ? [p.Variant] : []
      );
      setAllVariants(allVars);

      // Lưu tổng số từ backend
      setTotalProducts(result.total || 0);
      setTotalVariants(result.totalVariants || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      showToast("Không thể tải dữ liệu", "error");
      setProducts([]);
      setAllVariants([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage, getInventoryPaginated, itemsPerPage]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleToggleExpand = (product_id: number) => {
    setExpandedProductId(expandedProductId === product_id ? null : product_id);
  };

  // Calculate stats (chỉ cho trang hiện tại)
  const inStock = allVariants.filter((v) => v.variant_stock >= 20).length;
  const lowStock = allVariants.filter(
    (v) => v.variant_stock > 0 && v.variant_stock < 20
  ).length;
  const outOfStock = allVariants.filter((v) => v.variant_stock === 0).length;

  // Generate page numbers
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [1];

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

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
            {loading ? (
              <tr>
                <td
                  colSpan={2}
                  className="text-center py-10 text-gray-400 text-lg"
                >
                  Đang tải...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="text-center py-10 text-gray-400 text-lg"
                >
                  Không tìm thấy sản phẩm nào.
                </td>
              </tr>
            ) : (
              products.map((product: any) => (
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
                            <span>
                              Tồn kho: {product.Variant.variant_stock}
                            </span>
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ←
          </button>

          {getPageNumbers().map((pageNum, idx) =>
            pageNum === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum as number)}
                className={`px-3 py-1 border ${
                  currentPage === pageNum
                    ? "bg-black text-white border-black"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            →
          </button>
        </div>
      )}

      {/* Create Variant Modal */}
      {showCreateModal && (
        <CreateVariantForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchInventory}
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
          onSuccess={fetchInventory}
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
