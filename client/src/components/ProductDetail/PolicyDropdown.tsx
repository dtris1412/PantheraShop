import { useState } from "react";
import { ChevronDown, Truck, RotateCcw, Shield } from "lucide-react";

export default function PolicyDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-b py-6 mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-2xl font-semibold">Chính sách</span>
        <ChevronDown
          className={`w-6 h-6 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <div className="mt-6 space-y-6">
          <div className="flex items-start gap-4">
            <Truck className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-1">Miễn phí vận chuyển</h4>
              <p className="text-sm text-gray-600">
                Miễn phí vận chuyển cho đơn hàng trên 2.000.000 đ
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <RotateCcw className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-1">Đổi trả dễ dàng</h4>
              <p className="text-sm text-gray-600">
                Đổi trả trong 60 ngày với sản phẩm chưa sử dụng
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-1">Bảo hành 2 năm</h4>
              <p className="text-sm text-gray-600">
                Bảo hành chính hãng 2 năm cho mọi sản phẩm
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
