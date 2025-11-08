import React, { useState } from "react";
import { showToast } from "../../../shared/components/Toast";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/api/admin/products/excel/template",
        {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to download template");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template_inventory_stock.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast("Đã tải template thành công", "success");
    } catch (error) {
      console.error("Download template error:", error);
      showToast("Không thể tải template", "error");
    }
  };

  const handleImport = async () => {
    if (!excelFile) return;

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("excel", excelFile);

      const response = await fetch(
        "http://localhost:8080/api/admin/inventory/excel/import-stock",
        {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to import Excel");

      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Import failed");

      // Display result message from backend
      showToast(result.message || "Import thành công", "success");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Import error:", error);
      showToast(
        error instanceof Error ? error.message : "Không thể import file",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setExcelFile(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className="bg-white shadow-2xl w-full max-w-2xl p-0 relative border border-gray-300 flex flex-col"
        style={{ borderRadius: 0, minHeight: 480 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-3xl font-bold tracking-tight text-black">
            Import tồn kho từ Excel
          </h2>
          <button
            className="text-gray-400 hover:text-black text-3xl"
            onClick={handleClose}
            disabled={uploading}
            title="Đóng"
          >
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form
          className="flex-1 px-10 py-8 flex flex-col gap-8 justify-center"
          onSubmit={(e) => {
            e.preventDefault();
            handleImport();
          }}
        >
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Hướng dẫn sử dụng:
            </h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Tải file mẫu Excel bên dưới</li>
              <li>
                Điền thông tin vào sheet "Variants": product_name, variant_size,
                variant_color, variant_stock
              </li>
              <li>
                Chỉ các variant đã tồn tại trong hệ thống mới được cập nhật
              </li>
              <li>Upload file Excel đã điền để import</li>
            </ol>
          </div>

          {/* 1. Khung tải template */}
          <div>
            <label className="block text-lg font-semibold mb-3 text-gray-700">
              Tải file mẫu
            </label>
            <button
              className="w-full px-5 py-4 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 hover:bg-gray-200 text-base font-semibold text-black transition-colors duration-200 shadow-sm disabled:opacity-50"
              style={{ borderRadius: 0 }}
              onClick={handleDownloadTemplate}
              type="button"
              disabled={uploading}
            >
              Bấm để tải file mẫu Excel
            </button>
            <div className="text-xs text-gray-500 mt-2">
              Sử dụng sheet "Variants" để cập nhật stock cho các biến thể đã có
            </div>
          </div>

          {/* 2. Khung import file excel */}
          <div>
            <label className="block text-lg font-semibold mb-3 text-gray-700">
              Import file Excel
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="block w-full text-base text-gray-700 file:mr-4 file:py-4 file:px-4 file:rounded-none file:border-0 file:text-base file:font-semibold file:bg-gray-50 file:text-black hover:file:bg-gray-100 border border-gray-300 disabled:opacity-50"
              onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
              style={{ borderRadius: 0 }}
              disabled={uploading}
            />
            {excelFile && (
              <div className="text-sm text-green-700 mt-2">
                Đã chọn: <span className="font-semibold">{excelFile.name}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 bg-gray-50">
            <button
              className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-100 text-lg font-medium transition-colors duration-200 disabled:opacity-50"
              style={{ borderRadius: 0 }}
              onClick={handleClose}
              type="button"
              disabled={uploading}
            >
              Hủy
            </button>
            <button
              className="px-6 py-3 bg-black text-white hover:bg-gray-900 text-lg font-semibold transition-colors duration-200 disabled:opacity-50"
              style={{ borderRadius: 0 }}
              type="submit"
              disabled={!excelFile || uploading}
            >
              {uploading ? "Đang import..." : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportExcelModal;
