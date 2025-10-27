import { useLocation, useNavigate } from "react-router-dom";

function formatVND(value: number | string) {
  return Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const ORDER_STATUS_STEPS = [
  { key: "Pending", label: "Chờ xác nhận" },
  { key: "Processing", label: "Đang xử lý" },
  { key: "Shipped", label: "Đang vận chuyển" },
  { key: "Delivered", label: "Đã giao" },
];

function getStatusIndex(status: string) {
  switch (status) {
    case "Chờ xác nhận":
    case "Pending":
      return 0;
    case "Đang xử lý":
    case "Processing":
      return 1;
    case "Đang vận chuyển":
    case "Shipped":
      return 2;
    case "Đã giao":
    case "Delivered":
      return 3;
    case "Đã hủy":
    case "Cancelled":
      return -1;
    default:
      return 0;
  }
}

export default function OrderDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p>Không tìm thấy đơn hàng.</p>
          <button
            className="mt-4 px-4 py-2 bg-black text-white"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Tính toán các giá trị động từ dữ liệu đơn hàng
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

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Chi tiết đơn hàng
          </h1>
        </div>
        <div className="text-gray-500 mb-8">
          Mã đơn hàng <span className="font-semibold">{order.order_id}</span>
          {"  "} &bull;{" "}
          {order.order_date &&
            new Date(order.order_date).toLocaleDateString("vi-VN")}
        </div>

        {/* Danh sách sản phẩm */}
        {order.orderProducts?.map((item: any, idx: number) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row border-b border-gray-200 py-8"
          >
            <div className="md:w-1/3 flex-shrink-0 flex items-center justify-center mb-6 md:mb-0">
              <img
                src={item.Variant?.Product?.product_image}
                alt={item.Variant?.Product?.product_name}
                className="w-full h-auto md:w-[420px] md:h-[350px] object-cover bg-gray-100"
                style={{ maxWidth: "100%", maxHeight: "520px" }}
              />
            </div>
            <div className="md:w-2/3 md:pl-10 flex flex-col justify-between">
              <div>
                <div className="font-bold text-lg mb-2">
                  {item.Variant?.Product?.product_name}
                  <span className="ml-2 text-gray-700 font-semibold">
                    {formatVND(item.price_at_time)}
                  </span>
                </div>
                <div className="text-gray-600 mb-2">
                  {item.Variant?.Product?.product_description}
                </div>
                <div className="text-gray-500 text-sm mb-2">
                  Size: {item.Variant?.variant_size ?? "-"} | Màu:{" "}
                  {item.Variant?.variant_color ?? "-"} | SL: {item.quantity}
                </div>
                <div className="text-gray-500 text-sm mb-2">
                  Loại: {item.Variant?.Product?.Category?.category_name}
                </div>
                <div className="flex flex-wrap gap-8 mt-6">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">
                      Địa chỉ nhận hàng
                    </div>
                    <div className="text-gray-500">
                      Tên người nhận: {order.recipient_name}
                    </div>
                    <div className="text-gray-500">
                      Số điện thoại: {order.recipient_phone}
                    </div>
                    <div className="text-gray-500">
                      Địa chỉ: {order.recipient_address}
                    </div>
                  </div>
                </div>
              </div>
              {/* Thanh tiến trình trạng thái đơn hàng */}
              <div className="mt-8">
                <div className="text-xs text-gray-500 mb-2">
                  {ORDER_STATUS_STEPS[statusIdx]?.label
                    ? `${ORDER_STATUS_STEPS[statusIdx]?.label} vào ngày ${
                        order.order_date &&
                        new Date(order.order_date).toLocaleDateString("vi-VN")
                      }`
                    : "Đã hủy"}
                </div>
                <div className="w-full flex flex-col gap-2">
                  {/* Progress bar thon gọn */}
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
                        borderRadius: "4px",
                        transition: "width 0.3s",
                      }}
                    />
                    {/* Các điểm trạng thái nhỏ, thon gọn */}
                    <div
                      className="absolute top-1/2 left-0 w-full flex justify-between items-center pointer-events-none"
                      style={{ transform: "translateY(-50%)" }}
                    >
                      {ORDER_STATUS_STEPS.map((step, idx) => (
                        <div
                          key={step.key}
                          className={`w-3 h-3 flex items-center justify-center font-bold text-[10px]
                            ${
                              statusIdx === -1
                                ? idx === 0
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-300 text-gray-400"
                                : idx <= statusIdx
                                ? "bg-black text-white"
                                : "bg-gray-300 text-gray-400"
                            }
                          `}
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
                  {/* Label trạng thái */}
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

        {/* Thông tin thanh toán & tổng kết */}
        <div className="bg-gray-100 mt-12 mb-10 px-0 py-0">
          {/* Thông tin thanh toán */}
          <div className="px-8 pt-8 pb-4">
            <div className="font-bold text-lg mb-4">Thông tin thanh toán</div>
            <div className="mb-2 text-sm">
              <span className="font-semibold">Tên người nhận:</span>{" "}
              {order.recipient_name}
            </div>
            <div className="mb-2 text-sm">
              <span className="font-semibold">Số điện thoại:</span>{" "}
              {order.recipient_phone}
            </div>
            <div className="mb-2 text-sm">
              <span className="font-semibold">Địa chỉ:</span>{" "}
              {order.recipient_address}
            </div>
            <div className="mb-2 text-sm">
              <span className="font-semibold">Phương thức thanh toán:</span>{" "}
              {order.payment_method || order.payment_type || "Tiền mặt"}
            </div>
            <div className="mb-2 text-sm">
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
          <div className="border-t border-gray-300 mx-8"></div>
          {/* Tổng kết */}
          <div className="px-8 py-6">
            <div className="mb-2 flex justify-between text-gray-700 text-sm">
              <span>Tạm tính</span>
              <span>{formatVND(order.total_amount)}</span>
            </div>
            <div className="mb-2 flex justify-between text-gray-700 text-sm">
              <span>Phí vận chuyển</span>
              <span>{shipping === 0 ? "Miễn phí" : formatVND(shipping)}</span>
            </div>
            <div className="mt-4 flex justify-between text-black font-bold text-base border-t pt-3">
              <span>Tổng cộng</span>
              <span>{formatVND(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="px-6 py-3 bg-black text-white font-semibold text-lg"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
