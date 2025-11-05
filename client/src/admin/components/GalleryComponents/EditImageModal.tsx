import React, { useState } from "react";
import {
  useProductImageContext,
  ProductImage,
} from "../../contexts/product_imageContext";

interface EditImageModalProps {
  image: ProductImage | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditImageModal: React.FC<EditImageModalProps> = ({
  image,
  open,
  onClose,
  onSuccess,
}) => {
  const { updateProductImage, uploadGalleryImage, fetchAllImages } =
    useProductImageContext();
  const [order, setOrder] = useState(image?.order || 0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(image?.image_url || "");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setOrder(image?.order || 0);
    setPreview(image?.image_url || "");
    setFile(null);
  }, [image, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!image) return;
    setSaving(true);
    try {
      let updateData: any = { order };
      if (file) {
        const imageUrl = await uploadGalleryImage(file);
        updateData.image_url = imageUrl;
      }
      await updateProductImage(image.product_image_id, updateData);
      await fetchAllImages();
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert("Có lỗi khi cập nhật ảnh!");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !image) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="bg-white p-0 shadow-lg w-full max-w-md"
        style={{ borderRadius: 0 }}
      >
        <div
          className="p-8 border-b border-gray-200"
          style={{ borderRadius: 0 }}
        >
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight uppercase">
            Sửa ảnh sản phẩm
          </h2>
        </div>
        <div className="p-8">
          <div className="mb-6 flex flex-col items-center">
            <img
              src={preview}
              alt="preview"
              className="w-40 h-40 object-cover mb-4"
              style={{
                borderRadius: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-2"
              style={{ borderRadius: 0 }}
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-1">
              Thứ tự hiển thị:
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-300 text-sm"
              style={{ borderRadius: 0 }}
            />
          </div>
        </div>
        <div
          className="flex justify-end gap-2 border-t border-gray-200 p-6"
          style={{ borderRadius: 0 }}
        >
          <button
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold uppercase"
            onClick={onClose}
            disabled={saving}
            style={{ borderRadius: 0 }}
          >
            Hủy
          </button>
          <button
            className="px-5 py-2 bg-black text-white font-semibold uppercase"
            onClick={handleSave}
            disabled={saving}
            style={{ borderRadius: 0 }}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditImageModal;
