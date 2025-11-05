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
      console.log("Dữ liệu gửi lên updateProductImage:", updateData);
      const res = await updateProductImage(image.product_image_id, updateData);
      console.log("Kết quả trả về từ backend:", res);
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
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Sửa ảnh sản phẩm</h2>
        <div className="mb-4">
          <img
            src={preview}
            alt="preview"
            className="w-32 h-32 object-cover rounded mb-2"
          />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Thứ tự hiển thị:</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
            disabled={saving}
          >
            Hủy
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditImageModal;
