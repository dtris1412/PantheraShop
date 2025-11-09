import { useState, useEffect } from "react";
import { X, Upload, FileSpreadsheet, Download, ImagePlus } from "lucide-react";
import { useSupplier } from "../../contexts/supplierContext";
import { useCategory } from "../../contexts/categoryContext";
import { showToast } from "../../../shared/components/Toast";
const apiUrl = import.meta.env.VITE_API_URL;
interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ImportExcelModal = ({
  isOpen,
  onClose,
  onSuccess,
}: ImportExcelModalProps) => {
  const {
    suppliers,
    loading: suppliersLoading,
    fetchSuppliers,
  } = useSupplier();
  const { getAllTeams } = useCategory();
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    null
  );
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch suppliers when modal opens
  useEffect(() => {
    if (isOpen && suppliers.length === 0) {
      fetchSuppliers();
    }
  }, [isOpen, fetchSuppliers, suppliers.length]);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    if (!selectedSupplierId) {
      showToast("Vui lòng chọn nhà cung cấp trước", "error");
      return;
    }

    try {
      // Lấy tất cả teams từ categoryContext
      const teams = await getAllTeams();
      const teamIds = teams.map((team) => ({
        team_id: team.team_id,
        team_name: team.team_name,
      }));

      // Gửi supplier_id và teamIds đến backend
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/admin/products/excel/template`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplier_id: selectedSupplierId,
          teams: teamIds,
        }),
      });

      if (!response.ok) throw new Error("Failed to download template");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `product_template_supplier_${selectedSupplierId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast("Tải template thành công", "success");
    } catch (error) {
      console.error("Download template error:", error);
      showToast("Không thể tải template", "error");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedImages([...uploadedImages, ...Array.from(files)]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedSupplierId) {
      showToast("Vui lòng chọn nhà cung cấp", "error");
      return;
    }

    if (!excelFile) {
      showToast("Vui lòng chọn file Excel", "error");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("token");

      // Step 1: Upload images first (if any)
      let imageMapping: { filename: string; url: string }[] = [];
      if (uploadedImages.length > 0) {
        const imageFormData = new FormData();
        uploadedImages.forEach((file) => {
          imageFormData.append("images", file);
        });

        const imageResponse = await fetch(
          `${apiUrl}/admin/products/upload-excel-images`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageFormData,
          }
        );

        if (!imageResponse.ok) throw new Error("Failed to upload images");

        const imageResult = await imageResponse.json();
        if (!imageResult.success) throw new Error("Image upload failed");

        imageMapping = imageResult.images;
      }

      // Step 2: Upload Excel file with image mapping
      const formData = new FormData();
      formData.append("excel", excelFile);

      // Add images if any were uploaded
      uploadedImages.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(
        `${apiUrl}/admin/products/excel/import-with-variants`,
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
        error instanceof Error ? error.message : "Không thể import sản phẩm",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedSupplierId(null);
      setUploadedImages([]);
      setExcelFile(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black uppercase tracking-tight">
            Import Sản Phẩm Từ Excel
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Step 1: Select Supplier */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-black uppercase tracking-wide">
              Bước 1: Chọn Nhà Cung Cấp
            </label>
            <select
              value={selectedSupplierId || ""}
              onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
              disabled={uploading}
              className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors disabled:bg-gray-100"
            >
              <option value="">-- Chọn nhà cung cấp --</option>
              {suppliers
                .filter((s) => s.is_active)
                .map((supplier) => (
                  <option
                    key={supplier.supplier_id}
                    value={supplier.supplier_id}
                  >
                    {supplier.supplier_name}
                  </option>
                ))}
            </select>
          </div>

          {/* Step 2: Download Template */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-black uppercase tracking-wide">
              Bước 2: Tải Template Excel
            </label>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={!selectedSupplierId || uploading}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              <span className="font-medium">Tải Template</span>
            </button>
            <p className="text-xs text-gray-600">
              Template sẽ có sẵn thông tin nhà cung cấp và danh sách đội bóng
            </p>
          </div>

          {/* Step 3: Upload Images */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-black uppercase tracking-wide">
              Bước 3: Tải Ảnh Sản Phẩm (Nếu Có)
            </label>
            <div className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-black transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <ImagePlus size={40} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Click để chọn ảnh
                </span>
              </label>
            </div>

            {/* Image Preview */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {uploadedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-24 object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={uploading}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-600">
              Tên file ảnh phải khớp với tên trong cột "product_image" của Excel
            </p>
          </div>

          {/* Step 4: Upload Excel */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-black uppercase tracking-wide">
              Bước 4: Tải File Excel
            </label>
            <div className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-black transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                disabled={uploading}
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileSpreadsheet size={40} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {excelFile ? excelFile.name : "Click để chọn file Excel"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="px-5 py-2.5 border border-gray-300 text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <span className="font-medium">Hủy</span>
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!selectedSupplierId || !excelFile || uploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={20} />
            <span className="font-medium">
              {uploading ? "Đang import..." : "Import"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExcelModal;
