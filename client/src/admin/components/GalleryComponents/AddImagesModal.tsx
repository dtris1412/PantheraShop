import React, { useRef, useState } from "react";
import { useProductImageContext } from "../../contexts/product_imageContext";

interface AddImagesModalProps {
  productId: number;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type FileWithOrder = {
  file: File;
  order: number;
};

const AddImagesModal: React.FC<AddImagesModalProps> = ({
  productId,
  open,
  onClose,
  onSuccess,
}) => {
  const { uploadGalleryImage, createProductImage, fetchAllImages } =
    useProductImageContext();
  const [files, setFiles] = useState<FileWithOrder[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const arr = Array.from(e.target.files).map((file, idx) => ({
        file,
        order: idx + 1,
      }));
      setFiles(arr);
    }
  };

  const handleOrderChange = (idx: number, value: number) => {
    setFiles((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, order: value } : item))
    );
  };

  const handleRemove = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      for (const { file, order } of files) {
        const url = await uploadGalleryImage(file);
        await createProductImage({
          product_id: productId,
          image_url: url,
          order,
        });
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
      <div
        className="bg-white p-0 shadow-lg w-full max-w-xl"
        style={{ borderRadius: 0 }}
      >
        <div
          className="p-8 border-b border-gray-200"
          style={{ borderRadius: 0 }}
        >
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight uppercase">
            Thêm ảnh sản phẩm
          </h2>
          <p className="text-gray-500 mb-4 text-sm">
            Chọn nhiều ảnh, đặt thứ tự hiển thị cho từng ảnh.
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
            style={{ borderRadius: 0 }}
          />
        </div>
        <div className="p-8">
          {files.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {files.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center bg-gray-50 border border-gray-200 p-3 mr-2"
                  style={{ borderRadius: 0, minWidth: 160, maxWidth: 180 }}
                >
                  <img
                    src={URL.createObjectURL(item.file)}
                    alt="preview"
                    className="w-32 h-32 object-cover mb-2"
                    style={{
                      borderRadius: 0,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  />
                  <div className="flex items-center gap-1 mb-2 w-full">
                    <span className="text-xs text-gray-500">Thứ tự:</span>
                    <input
                      type="number"
                      min={1}
                      value={item.order}
                      onChange={(e) =>
                        handleOrderChange(idx, Number(e.target.value))
                      }
                      className="w-14 px-2 py-1 border border-gray-300 text-sm"
                      style={{ borderRadius: 0 }}
                    />
                  </div>
                  <button
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => handleRemove(idx)}
                    type="button"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
          {files.length === 0 && (
            <div className="text-gray-400 text-center py-8 text-sm">
              Chưa chọn ảnh nào.
            </div>
          )}
        </div>
        <div
          className="flex justify-end gap-2 border-t border-gray-200 p-6"
          style={{ borderRadius: 0 }}
        >
          <button
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold uppercase"
            onClick={onClose}
            disabled={uploading}
            style={{ borderRadius: 0 }}
          >
            Hủy
          </button>
          <button
            className="px-5 py-2 bg-black text-white font-semibold uppercase"
            onClick={handleUpload}
            disabled={uploading || !files.length}
            style={{ borderRadius: 0 }}
          >
            {uploading ? "Đang tải..." : "Tải lên"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddImagesModal;
