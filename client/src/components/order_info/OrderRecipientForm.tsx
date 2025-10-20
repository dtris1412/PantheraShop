import React from "react";

interface RecipientInfo {
  name: string;
  phone: string;
  address: string;
  note: string;
}

export default function OrderRecipientForm({
  value,
  onChange,
}: {
  value: RecipientInfo;
  onChange: (v: RecipientInfo) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h2 className="text-xl font-bold mb-4">Thông tin người nhận</h2>
      <div className="space-y-4">
        <input
          className="w-full border border-gray-300 rounded px-4 py-2"
          placeholder="Họ và tên"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
        <input
          className="w-full border border-gray-300 rounded px-4 py-2"
          placeholder="Số điện thoại"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
        />
        <input
          className="w-full border border-gray-300 rounded px-4 py-2"
          placeholder="Địa chỉ nhận hàng"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
        <textarea
          className="w-full border border-gray-300 rounded px-4 py-2"
          placeholder="Ghi chú (nếu có)"
          value={value.note}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
        />
      </div>
    </div>
  );
}
