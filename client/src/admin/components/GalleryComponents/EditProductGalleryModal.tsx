import React, { useState, useEffect } from "react";
import {
  useProductImageContext,
  ProductImage,
} from "../../contexts/product_imageContext";
import AddImagesModal from "./AddImagesModal";

interface EditProductGalleryModalProps {
  productId: number | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditProductGalleryModal: React.FC<EditProductGalleryModalProps> = ({
  productId,
  open,
  onClose,
  onSuccess,
}) => {
  const {
    fetchImagesByProductId,
    updateProductImage,
    deleteProductImage,
    uploadGalleryImage,
    fetchAllImages,
  } = useProductImageContext();

  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editStates, setEditStates] = useState<
    Record<number, { file: File | null; order: number }>
  >({});
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    if (open && productId) {
      setLoading(true);
      fetchImagesByProductId(productId)
        .then((imgs) => {
          setImages(imgs);
          const states: Record<number, { file: File | null; order: number }> =
            {};
          imgs.forEach((img) => {
            states[img.product_image_id] = { file: null, order: img.order };
          });
          setEditStates(states);
        })
        .finally(() => setLoading(false));
    }
  }, [open, productId, fetchImagesByProductId]);

  const handleFileChange = (id: number, file: File | null) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], file },
    }));
  };

  const handleOrderChange = (id: number, order: number) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], order },
    }));
  };

  const handleDelete = async (img: ProductImage) => {
    if (window.confirm("Bạn có chắc muốn xóa ảnh này?")) {
      await deleteProductImage(img.product_image_id);
      const imgs = await fetchImagesByProductId(productId!);
      setImages(imgs);
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      for (const img of images) {
        const state = editStates[img.product_image_id];
        let updateData: any = { order: state.order };
        if (state.file) {
          const url = await uploadGalleryImage(state.file);
          updateData.image_url = url;
        }
        await updateProductImage(img.product_image_id, updateData);
      }
      // Chỉ gọi fetchAllImages 1 lần ở đây
      await fetchAllImages();
      onSuccess && onSuccess(); // Nếu cha truyền vào thì chỉ là đóng modal, không reload nữa
      onClose();
    } catch (err) {
      alert("Có lỗi khi cập nhật ảnh!");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !productId) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">
          Sửa toàn bộ ảnh gallery sản phẩm
        </h2>
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <>
            <button
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setAddModalOpen(true)}
            >
              Thêm ảnh mới
            </button>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => (
                <div
                  key={img.product_image_id}
                  className="border p-2 rounded relative"
                >
                  <img
                    src={
                      editStates[img.product_image_id]?.file
                        ? URL.createObjectURL(
                            editStates[img.product_image_id].file!
                          )
                        : img.image_url
                    }
                    alt=""
                    className="w-full h-32 object-cover rounded"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2"
                    onChange={(e) =>
                      handleFileChange(
                        img.product_image_id,
                        e.target.files && e.target.files[0]
                          ? e.target.files[0]
                          : null
                      )
                    }
                  />
                  <div className="mt-2">
                    <label className="block text-xs">Thứ tự:</label>
                    <input
                      type="number"
                      value={
                        editStates[img.product_image_id]?.order ?? img.order
                      }
                      onChange={(e) =>
                        handleOrderChange(
                          img.product_image_id,
                          Number(e.target.value)
                        )
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  </div>
                  <button
                    className="absolute top-2 right-2 bg-red-500 text-white rounded px-2 py-1 text-xs"
                    onClick={() => handleDelete(img)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSaveAll}
                disabled={loading}
              >
                Lưu tất cả
              </button>
            </div>
          </>
        )}
        {/* Modal thêm ảnh mới */}
        <AddImagesModal
          productId={productId}
          open={addModalOpen}
          onClose={async () => {
            setAddModalOpen(false);
            // Chỉ reload lại gallery nhỏ, không gọi onSuccess ở đây
            const imgs = await fetchImagesByProductId(productId);
            setImages(imgs);
          }}
          onSuccess={undefined} // Không cần truyền gì ở đây
        />
      </div>
    </div>
  );
};

export default EditProductGalleryModal;
