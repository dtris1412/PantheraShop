import React, { useState } from "react";
import * as XLSX from "xlsx";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const generateTemplate = () => {
  // Sheet 1: Products
  const products = [
    {
      product_id: "",
      product_name: "Áo Nike Pro",
      product_price: 499000,
      product_description: "Áo thể thao nam",
      release_date: "",
      created_at: "",
      updated_at: "",
      product_image: "",
      team_id: "",
      category_id: 1,
      is_active: 1,
      supplier_id: "",
    },
    {
      product_id: "",
      product_name: "Quần Adidas Run",
      product_price: 399000,
      product_description: "Quần chạy bộ nữ",
      release_date: "",
      created_at: "",
      updated_at: "",
      product_image: "",
      team_id: "",
      category_id: 4,
      is_active: 1,
      supplier_id: "",
    },
  ];

  // Sheet 2: Variants
  const variants = [
    {
      variant_id: "",
      variant_size: "M",
      variant_stock: "",
      product_id: "",
      variant_color: "Đen",
    },
    {
      variant_id: "",
      variant_size: "L",
      variant_stock: "",
      product_id: "",
      variant_color: "Đen",
    },
  ];

  const wb = XLSX.utils.book_new();
  const wsProducts = XLSX.utils.json_to_sheet(products);
  const wsVariants = XLSX.utils.json_to_sheet(variants);

  XLSX.utils.book_append_sheet(wb, wsProducts, "Products");
  XLSX.utils.book_append_sheet(wb, wsVariants, "Variants");

  XLSX.writeFile(wb, "template_import_kho.xlsx");
};

const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);

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
            onClick={() => {
              onClose();
              setImportFile(null);
            }}
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
          onSubmit={(e) => e.preventDefault()}
        >
          {/* 1. Khung tải template */}
          <div>
            <label className="block text-lg font-semibold mb-3 text-gray-700">
              Tải file mẫu
            </label>
            <button
              className="w-full px-5 py-4 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 hover:bg-gray-200 text-base font-semibold text-black transition-colors duration-200 shadow-sm"
              style={{ borderRadius: 0 }}
              onClick={generateTemplate}
              type="button"
            >
              Bấm để tải file mẫu Excel
            </button>
            <div className="text-xs text-gray-500 mt-2">
              category_id: 1 = Áo đấu, 2 = Giày, 3 = Bóng, 4 = Phụ kiện
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
              className="block w-full text-base text-gray-700 file:mr-4 file:py-4 file:px-4 file:rounded-none file:border-0 file:text-base file:font-semibold file:bg-gray-50 file:text-black hover:file:bg-gray-100 border border-gray-300"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              style={{ borderRadius: 0 }}
            />
            {importFile && (
              <div className="text-sm text-green-700 mt-2">
                Đã chọn:{" "}
                <span className="font-semibold">{importFile.name}</span>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 bg-gray-50">
            <button
              className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-100 text-lg font-medium transition-colors duration-200"
              style={{ borderRadius: 0 }}
              onClick={() => {
                onClose();
                setImportFile(null);
              }}
              type="button"
            >
              Hủy
            </button>
            <button
              className="px-6 py-3 bg-black text-white hover:bg-gray-900 text-lg font-semibold transition-colors duration-200 disabled:opacity-50"
              style={{ borderRadius: 0 }}
              type="button"
              disabled={!importFile}
            >
              Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportExcelModal;
