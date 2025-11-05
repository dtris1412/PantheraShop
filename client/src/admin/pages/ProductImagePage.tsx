import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import { useProductImageContext } from "../contexts/product_imageContext";
import AddImagesModal from "../components/GalleryComponents/AddImagesModal";
import EditImageModal from "../components/GalleryComponents/EditImageModal";
import { ProductImage } from "../contexts/product_imageContext";

const ProductImagePage: React.FC = () => {
  const { images, loading, fetchAllImages, deleteProductImage } =
    useProductImageContext();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);

  useEffect(() => {
    fetchAllImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lấy danh sách sản phẩm duy nhất từ images
  const products = React.useMemo(() => {
    const map = new Map();
    images.forEach((img: any) => {
      if (img.Product && !map.has(img.Product.product_id)) {
        map.set(img.Product.product_id, img.Product);
      }
    });
    return Array.from(map.values());
  }, [images]);

  // Lọc sản phẩm theo searchTerm
  const filteredProducts = React.useMemo(() => {
    if (!searchTerm.trim()) return products;
    return products.filter((product: any) =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Lấy ảnh theo product_id
  const getImagesByProduct = (product_id: number) =>
    images.filter((img: any) => img.product_id === product_id);

  // Thêm hàm mở modal thêm ảnh
  const handleAddImage = (productId: number) => {
    setSelectedProductId(productId);
    setAddModalOpen(true);
    setMenuOpen(null);
  };

  // Thêm hàm mở modal sửa ảnh
  const handleEditImage = (img: ProductImage) => {
    setSelectedImage(img);
    setEditModalOpen(true);
  };

  // Xử lý xóa ảnh
  const handleDeleteImage = async (img: ProductImage) => {
    if (window.confirm("Bạn có chắc muốn xóa ảnh này?")) {
      await deleteProductImage(img.product_image_id);
      fetchAllImages();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Quản lý thư viện ảnh
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý ảnh gallery cho từng sản phẩm
          </p>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="bg-white p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-200"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              <th className="px-4 py-4"></th>
              <th className="px-4 py-4">Sản phẩm</th>
              <th className="px-4 py-4">Số ảnh</th>
              <th className="px-4 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-10 text-gray-400 text-lg"
                >
                  Không tìm thấy sản phẩm nào.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product: any) => {
                const gallery = getImagesByProduct(product.product_id);
                return (
                  <React.Fragment key={product.product_id}>
                    <tr className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-4 align-top">
                        <button
                          className="p-1"
                          onClick={() =>
                            setExpanded(
                              expanded === product.product_id
                                ? null
                                : product.product_id
                            )
                          }
                          title="Xem ảnh"
                        >
                          {expanded === product.product_id ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {product.product_image ? (
                            <img
                              src={product.product_image}
                              alt={product.product_name}
                              className="w-12 h-12 object-cover border border-gray-200"
                              style={{ borderRadius: 0 }}
                            />
                          ) : (
                            <div
                              className="w-12 h-12 bg-gray-100 flex items-center justify-center"
                              style={{ borderRadius: 0 }}
                            >
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-black line-clamp-1">
                              {product.product_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-black">
                          {gallery.length}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative">
                          <button
                            className="p-2 hover:bg-gray-100"
                            onClick={() =>
                              setMenuOpen(
                                menuOpen === product.product_id
                                  ? null
                                  : product.product_id
                              )
                            }
                            title="Thao tác"
                          >
                            <MoreVertical size={20} />
                          </button>
                          {/* Menu thao tác (placeholder) */}
                          {menuOpen === product.product_id && (
                            <div className="absolute z-10 right-0 mt-2 w-36 bg-white border border-gray-200 shadow">
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                                onClick={() =>
                                  handleAddImage(product.product_id)
                                }
                              >
                                <Plus size={16} className="inline mr-2" />
                                Thêm ảnh
                              </button>
                              {/* Có thể thêm các thao tác khác nếu muốn */}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded === product.product_id && (
                      <tr>
                        <td colSpan={4} className="bg-gray-50 px-8 py-6">
                          {gallery.length === 0 ? (
                            <div className="text-gray-400 text-sm">
                              Sản phẩm này chưa có ảnh gallery nào.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                              {gallery.map((img: ProductImage) => (
                                <div
                                  key={img.product_image_id}
                                  className="relative bg-white border border-gray-200 overflow-hidden shadow-sm group transition-all duration-200"
                                  style={{ borderRadius: 0 }}
                                >
                                  <img
                                    src={img.image_url}
                                    alt={`Ảnh sản phẩm ${product.product_name}`}
                                    className="object-cover w-full h-40"
                                    style={{ borderRadius: 0 }}
                                  />
                                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                      className="bg-white p-1 shadow hover:bg-gray-200 border border-gray-200"
                                      style={{ borderRadius: 0 }}
                                      onClick={() => handleEditImage(img)}
                                      title="Sửa"
                                    >
                                      <Edit
                                        size={16}
                                        className="text-gray-700"
                                      />
                                    </button>
                                    <button
                                      className="bg-white p-1 shadow hover:bg-red-100 border border-gray-200"
                                      style={{ borderRadius: 0 }}
                                      onClick={() => handleDeleteImage(img)}
                                      title="Xóa"
                                    >
                                      <Trash2
                                        size={16}
                                        className="text-red-500"
                                      />
                                    </button>
                                  </div>
                                  <div
                                    className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1"
                                    style={{ borderRadius: 0 }}
                                  >
                                    Thứ tự: {img.order}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm ảnh */}
      <AddImagesModal
        productId={selectedProductId || 0}
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchAllImages}
      />

      {/* Modal sửa ảnh */}
      <EditImageModal
        image={selectedImage}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchAllImages}
      />
    </div>
  );
};

export default ProductImagePage;
