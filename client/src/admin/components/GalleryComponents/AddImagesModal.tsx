import React, { useRef, useState } from "react";
import { useProductImageContext } from "../../contexts/product_imageContext";

interface AddImagesModalProps {
  productId: number;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddImagesModal: React.FC<AddImagesModalProps> = ({
  productId,
  open,
  onClose,
  onSuccess,
}) => {
  const { uploadGalleryImage, createProductImage, fetchAllImages } =
    useProductImageContext();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadGalleryImage(file);
        await createProductImage({ product_id: productId, image_url: url });
      }
      await fetchAllImages();
      setFiles([]);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert("Có lỗi khi upload ảnh!");
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Thêm nhiều ảnh sản phẩm</h2>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4"
        />
        <div className="flex flex-wrap gap-2 mb-4">
          {files.map((file, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-16 h-16 object-cover rounded"
            />
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
            disabled={uploading}
          >
            Hủy
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleUpload}
            disabled={uploading || !files.length}
          >
            {uploading ? "Đang tải..." : "Tải lên"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddImagesModal;
