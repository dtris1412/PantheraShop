import React, { useRef } from "react";
import { Camera, X } from "lucide-react";
import { showToast } from "../../shared/components/Toast";

interface ImageUploadProps {
  currentImage?: string;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxSize?: number; // MB
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageSelect,
  onImageRemove,
  placeholder = "Chọn ảnh",
  disabled = false,
  maxSize = 5, // 5MB default
  className = "w-24 h-24",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn file ảnh", "error");
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      showToast(`File ảnh không được vượt quá ${maxSize}MB`, "error");
      return;
    }

    onImageSelect(file);
    showToast("Đã chọn ảnh thành công", "success");
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className={`${className} bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400 transition-colors ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleClick}
        >
          {currentImage ? (
            <img
              src={currentImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-xs text-center">{placeholder}</span>
            </div>
          )}
        </div>

        {/* Upload button */}
        {!currentImage && (
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
            title="Chọn ảnh"
          >
            <Camera size={14} />
          </button>
        )}

        {/* Remove button */}
        {currentImage && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 disabled:opacity-50 transition-colors duration-200"
            title="Xóa ảnh"
          >
            <X size={12} />
          </button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Tối đa {maxSize}MB
        <br />
        JPG, PNG, GIF
      </p>
    </div>
  );
};

export default ImageUpload;
