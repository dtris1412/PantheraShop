import React from "react";

interface RecipientInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

export default function OrderRecipientForm({
  value,
  onChange,
  error,
}: {
  value: RecipientInfo;
  onChange: (v: RecipientInfo) => void;
  error?: string;
}) {
  return (
    <div className="bg-white border border-gray-200  shadow p-6">
      <h2 className="text-xl font-bold mb-4">Thông tin người nhận</h2>
      {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Nhập họ và tên"
            value={value.name}
            required
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Nhập số điện thoại"
            value={value.phone}
            required
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Email nhận hàng <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Nhập email"
            value={value.email}
            required
            onChange={(e) => onChange({ ...value, email: e.target.value })}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Địa chỉ nhận hàng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Nhập địa chỉ"
            value={value.address}
            required
            onChange={(e) => onChange({ ...value, address: e.target.value })}
          />
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-gray-700">
            Ghi chú (tuỳ chọn)
          </label>
          <textarea
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ghi chú cho đơn hàng (nếu có)"
            value={value.note}
            onChange={(e) => onChange({ ...value, note: e.target.value })}
            rows={2}
          />
        </div>
      </form>
    </div>
  );
}
