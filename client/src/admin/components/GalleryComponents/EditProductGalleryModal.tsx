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
      <div className="bg-white p-0 shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div
          className="p-8 border-b border-gray-200"
          style={{ borderRadius: 0 }}
        >
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight uppercase">
            Sửa toàn bộ ảnh gallery sản phẩm
          </h2>
          <button
            className="mb-4 px-5 py-2 bg-black text-white font-semibold uppercase"
            style={{ borderRadius: 0 }}
            onClick={() => setAddModalOpen(true)}
          >
            Thêm ảnh mới
          </button>
        </div>
        <div className="p-8">
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {images.map((img) => (
                <div
                  key={img.product_image_id}
                  className="border border-gray-200 p-0 relative flex flex-col items-stretch"
                  style={{ borderRadius: 0, background: "#fff" }}
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
                    className="w-full h-44 object-cover"
                    style={{ borderRadius: 0 }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-3"
                    style={{ borderRadius: 0 }}
                    onChange={(e) =>
                      handleFileChange(
                        img.product_image_id,
                        e.target.files && e.target.files[0]
                          ? e.target.files[0]
                          : null
                      )
                    }
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Thứ tự:</span>
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
                      className="w-14 px-2 py-1 border border-gray-300 text-sm"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                  <button
                    className="absolute top-2 right-2 bg-white p-1 border border-gray-200 text-red-600 text-xs hover:bg-red-100"
                    style={{ borderRadius: 0 }}
                    onClick={() => handleDelete(img)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
          <div
            className="flex justify-end gap-2 border-t border-gray-200 p-6 mt-8"
            style={{ borderRadius: 0 }}
          >
            <button
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold uppercase"
              onClick={onClose}
              disabled={loading}
              style={{ borderRadius: 0 }}
            >
              Hủy
            </button>
            <button
              className="px-5 py-2 bg-black text-white font-semibold uppercase"
              onClick={handleSaveAll}
              disabled={loading}
              style={{ borderRadius: 0 }}
            >
              Lưu tất cả
            </button>
          </div>
        </div>
        {/* Modal thêm ảnh mới */}
        <AddImagesModal
          productId={productId}
          open={addModalOpen}
          onClose={async () => {
            setAddModalOpen(false);
            const imgs = await fetchImagesByProductId(productId);
            setImages(imgs);
          }}
          onSuccess={undefined}
        />
      </div>
    </div>
  );
};

export default EditProductGalleryModal;
