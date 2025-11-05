import React, { useState } from "react";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPLIERS = [
  { value: "nike", label: "Nike" },
  { value: "adidas", label: "Adidas" },
  { value: "puma", label: "Puma" },
  { value: "other", label: "Khác" },
];

const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState("");
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
              setSelectedSupplier("");
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
          onSubmit={e => e.preventDefault()}
        >
          {/* 1. Chọn nhà cung cấp */}
          <div>
            <label className="block text-lg font-semibold mb-3 text-gray-700">
              Chọn nhà cung cấp
            </label>
            <select
              className="w-full border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:border-black bg-gray-50 transition-colors duration-200"
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
              style={{ borderRadius: 0 }}
            >
              <option value="">-- Chọn nhà cung cấp --</option>
              {SUPPLIERS.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          {/* 2. Khung tải template */}
          <div>
            <label className="block text-lg font-semibold mb-3 text-gray-700">
              Tải file mẫu
            </label>
            <button
              className="w-full px-5 py-4 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 hover:bg-gray-200 text-base font-semibold text-black transition-colors duration-200 shadow-sm"
              style={{ borderRadius: 0 }}
              onClick={() => {
                window.open("/assets/template-import-variant.xlsx", "_blank");
              }}
              type="button"
            >
              Bấm để tải file mẫu Excel
            </button>
          </div>
          {/* 3. Khung import file excel */}
          <div>
            <label className="block text-lg font-semibold mb-3 text-gray-700">
              Import file Excel
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="block w-full text-base text-gray-700 file:mr-4 file:py-4 file:px-4 file:rounded-none file:border-0 file:text-base file:font-semibold file:bg-gray-50 file:text-black hover:file:bg-gray-100 border border-gray-300"
              onChange={e => setImportFile(e.target.files?.[0] || null)}
              style={{ borderRadius: 0 }}
            />
            {importFile && (
              <div className="text-sm text-green-700 mt-2">
                Đã chọn: <span className="font-semibold">{importFile.name}</span>
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
                setSelectedSupplier("");
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
              disabled={!selectedSupplier || !importFile}
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
