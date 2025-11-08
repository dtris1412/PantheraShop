import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useOrder } from "../contexts/orderContext";
import { showToast } from "../../shared/components/Toast";

function formatVND(value: number | string) {
  return Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const ORDER_STATUS_STEPS = [
  { key: "Chờ xác nhận", label: "Chờ xác nhận" },
  { key: "Đang xử lý", label: "Đang xử lý" },
  { key: "Đang vận chuyển", label: "Đang vận chuyển" },
  { key: "Đã giao", label: "Đã giao" },
];

const STATUS_OPTIONS = [
  "Chờ xác nhận",
  "Đang xử lý",
  "Đang vận chuyển",
  "Đã giao",
  "Đã hủy",
];

function getStatusIndex(status: string) {
  const index = ORDER_STATUS_STEPS.findIndex((step) => step.key === status);
  return status === "Đã hủy" ? -1 : index;
}

export default function OrderDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { approveOrder } = useOrder();
  const order = location.state?.order;

  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    order?.order_status || ""
  );

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy đơn hàng.</p>
          <button
            className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800"
            onClick={() => navigate("/admin/orders")}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const paymentMethod = order.payment_method || "Thanh toán khi nhận hàng";
  const paymentStatus =
    order.payment_status ||
    (order.order_status === "Đã giao" || order.order_status === "Delivered"
      ? "Đã thanh toán"
      : "Chưa thanh toán");
  const shipping =
    Number(order.shipping_fee) ??
    (Number(order.total_amount) < 1500000 ? 15000 : 0);
  const tax =
    Number(order.tax) ?? Math.round(Number(order.total_amount) * 0.04);
  const total = Number(order.total_amount) + (shipping || 0) + (tax || 0);
  const statusIdx = getStatusIndex(order.order_status);
  const isDelivered =
    order.order_status === "Đã giao" || order.order_status === "Đã hủy";

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.order_status) {
      showToast("Trạng thái không thay đổi", "info");
      return;
    }

    setIsUpdating(true);
    try {
      await approveOrder(order.order_id, selectedStatus);
      showToast("Cập nhật trạng thái thành công", "success");
      // Cập nhật order state
      order.order_status = selectedStatus;
      navigate("/admin/orders");
    } catch (error: any) {
      console.error("Error updating status:", error);
      showToast(error.message || "Không thể cập nhật trạng thái", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            CHI TIẾT ĐƠN HÀNG
          </h1>
          <p className="text-gray-600 mt-1">
            Mã đơn hàng <span className="font-semibold">#{order.order_id}</span>{" "}
            •{" "}
            {order.order_date &&
              new Date(order.order_date).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <button
          className="px-6 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors font-semibold"
          onClick={() => navigate("/admin/orders")}
        >
          Quay lại
        </button>
      </div>

      {/* Status Update Section */}
      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4 uppercase tracking-wider">
          Cập nhật trạng thái
        </h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Trạng thái đơn hàng
            </label>
            <select
              disabled={isDelivered}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none bg-white"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleUpdateStatus}
            disabled={
              isDelivered || isUpdating || selectedStatus === order.order_status
            }
            className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </div>

      {/* Order Products */}
      <div className="bg-white border border-gray-200">
        {order.orderProducts?.map((item: any, idx: number) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row border-b border-gray-200 last:border-b-0 p-6"
          >
            <div className="md:w-1/3 flex-shrink-0 flex items-center justify-center mb-6 md:mb-0">
              <img
                src={item.Variant?.Product?.product_image || "/placeholder.jpg"}
                alt={item.Variant?.Product?.product_name}
                className="w-full h-auto max-w-[350px] object-cover bg-gray-100"
              />
            </div>
            <div className="md:w-2/3 md:pl-8 flex flex-col justify-between">
              <div>
                <div className="font-bold text-xl mb-2">
                  {item.Variant?.Product?.product_name}
                </div>
                <div className="text-lg font-semibold text-gray-700 mb-3">
                  {formatVND(item.price_at_time)} × {item.quantity} ={" "}
                  {formatVND(item.price_at_time * item.quantity)}
                </div>
                <div className="text-gray-600 mb-3">
                  {item.Variant?.Product?.product_description}
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  <div>
                    <span className="font-semibold">Size:</span>{" "}
                    {item.Variant?.variant_size || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Màu:</span>{" "}
                    {item.Variant?.variant_color || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Loại:</span>{" "}
                    {item.Variant?.Product?.Category?.category_name}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="text-xs text-gray-500 mb-2">
                  {ORDER_STATUS_STEPS[statusIdx]?.label
                    ? `${ORDER_STATUS_STEPS[statusIdx]?.label} vào ngày ${
                        order.order_date &&
                        new Date(order.order_date).toLocaleDateString("vi-VN")
                      }`
                    : "Đã hủy"}
                </div>
                <div className="w-full flex flex-col gap-2">
                  <div className="relative w-full h-1.5 bg-gray-200">
                    <div
                      className={`absolute top-0 left-0 h-1.5 ${
                        statusIdx === -1 ? "bg-red-500" : "bg-black"
                      }`}
                      style={{
                        width:
                          statusIdx === -1
                            ? "0%"
                            : `${
                                ((statusIdx + 1) / ORDER_STATUS_STEPS.length) *
                                100
                              }%`,
                        transition: "width 0.3s",
                      }}
                    />
                    <div
                      className="absolute top-1/2 left-0 w-full flex justify-between items-center pointer-events-none"
                      style={{ transform: "translateY(-50%)" }}
                    >
                      {ORDER_STATUS_STEPS.map((step, idx) => (
                        <div
                          key={step.key}
                          className={`w-3 h-3 flex items-center justify-center font-bold text-[10px] ${
                            statusIdx === -1
                              ? idx === 0
                                ? "bg-red-500 text-white"
                                : "bg-gray-300 text-gray-400"
                              : idx <= statusIdx
                              ? "bg-black text-white"
                              : "bg-gray-300 text-gray-400"
                          }`}
                          style={{
                            borderRadius: "50%",
                            zIndex: 2,
                            boxShadow:
                              idx === statusIdx && statusIdx !== -1
                                ? "0 0 0 2px #000"
                                : undefined,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-black font-medium">
                    {ORDER_STATUS_STEPS.map((step, idx) => (
                      <span
                        key={step.key}
                        className={
                          (statusIdx === -1 && idx === 0) ||
                          (idx === statusIdx && statusIdx !== -1)
                            ? "underline"
                            : ""
                        }
                      >
                        {step.label}
                      </span>
                    ))}
                    {statusIdx === -1 && (
                      <span className="text-red-500 font-semibold ml-2">
                        Đã hủy
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Info & Summary */}
      <div className="bg-gray-100 border border-gray-200">
        <div className="px-8 pt-8 pb-4">
          <div className="font-bold text-lg mb-4 uppercase tracking-wider">
            Thông tin thanh toán
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Tên người nhận:</span>{" "}
              {order.recipient_name}
            </div>
            <div>
              <span className="font-semibold">Số điện thoại:</span>{" "}
              {order.recipient_phone}
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold">Địa chỉ:</span>{" "}
              {order.recipient_address}
            </div>
            <div>
              <span className="font-semibold">Phương thức thanh toán:</span>{" "}
              {paymentMethod}
            </div>
            <div>
              <span className="font-semibold">Trạng thái thanh toán:</span>{" "}
              <span
                className={
                  paymentStatus === "Đã thanh toán"
                    ? "text-green-600 font-bold"
                    : "text-yellow-600 font-bold"
                }
              >
                {paymentStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-300 mx-8"></div>
        <div className="px-8 py-6">
          <div className="mb-2 flex justify-between text-gray-700 text-sm">
            <span>Tạm tính</span>
            <span>{formatVND(order.total_amount)}</span>
          </div>
          <div className="mb-2 flex justify-between text-gray-700 text-sm">
            <span>Phí vận chuyển</span>
            <span>{shipping === 0 ? "Miễn phí" : formatVND(shipping)}</span>
          </div>
          <div className="mt-4 flex justify-between text-black font-bold text-lg border-t pt-3">
            <span>Tổng cộng</span>
            <span>{formatVND(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
