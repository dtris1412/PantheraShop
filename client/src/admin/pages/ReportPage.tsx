import React, { useEffect, useState } from "react";
import {
  useAdminReport,
  ReportFilters,
  PreviewReportData,
} from "../contexts/reportContext";
import { formatVND } from "../../utils/format";
import { useOrder } from "../contexts/orderContext";
import { useAdmin } from "../contexts/adminContext";
import { useVoucher } from "../contexts/voucherContext";
import { useBlog } from "../contexts/blogContext";
import { useProduct } from "../contexts/productContext";

const ReportPage: React.FC = () => {
  const { reports, loading, error, getAllReports, createReport, deleteReport } =
    useAdminReport();
  const { getAllOrders } = useOrder();
  const { getAllUsers } = useAdmin();
  const { getAllVouchers } = useVoucher();
  const { getAllBlogs } = useBlog();
  const { getAllProducts } = useProduct();

  const [reportType, setReportType] = useState<string>("revenue");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [filters, setFilters] = useState<ReportFilters>({});
  const [previewData, setPreviewData] = useState<PreviewReportData | null>(
    null
  );
  const [showPreview, setShowPreview] = useState<boolean>(false);

  useEffect(() => {
    getAllReports();
  }, []);

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setToDate(today.toISOString().split("T")[0]);
    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  // Preview báo cáo: tổng hợp dữ liệu từ các context
  const handlePreview = async () => {
    if (!fromDate || !toDate) {
      alert("Vui lòng chọn khoảng thời gian");
      return;
    }

    let preview: PreviewReportData | null = null;

    if (reportType === "revenue") {
      const orders = await getAllOrders?.();
      // Lọc đơn hàng theo thời gian, trạng thái, phương thức thanh toán
      const filteredOrders = (orders ?? []).filter((o) => {
        const orderDate = new Date(o.order_date);
        return (
          orderDate >= new Date(fromDate) &&
          orderDate <= new Date(toDate) &&
          o.order_status === "completed" &&
          (!filters.payment_method ||
            o.payment_method === filters.payment_method)
        );
      });
      const totalRevenue = filteredOrders.reduce(
        (sum, o) => sum + (o.total_amount || 0),
        0
      );
      preview = {
        report_type: "revenue",
        from_date: fromDate,
        to_date: toDate,
        total_value: totalRevenue,
        details: { orders: filteredOrders, total_revenue: totalRevenue },
      };
    }

    if (reportType === "orders") {
      const orders = await getAllOrders?.();
      const filteredOrders = (orders ?? []).filter((o) => {
        const orderDate = new Date(o.order_date);
        return (
          orderDate >= new Date(fromDate) &&
          orderDate <= new Date(toDate) &&
          (!filters.order_status || o.order_status === filters.order_status) &&
          (!filters.payment_method ||
            o.payment_method === filters.payment_method)
        );
      });
      preview = {
        report_type: "orders",
        from_date: fromDate,
        to_date: toDate,
        total_value: filteredOrders.length,
        details: { orders: filteredOrders },
      };
    }

    if (reportType === "products") {
      const products = await getAllProducts?.();
      // Tùy chỉnh logic tổng hợp sản phẩm bán chạy, số lượng, doanh thu...
      preview = {
        report_type: "products",
        from_date: fromDate,
        to_date: toDate,
        total_value: (products ?? []).length,
        details: { products: products ?? [] },
      };
    }

    if (reportType === "users") {
      const users = await getAllUsers?.();
      const orders = await getAllOrders?.();

      const filteredUsers = (users ?? []).filter((u) => {
        const regDate = new Date(u.created_at || "");
        return (
          regDate >= new Date(fromDate) &&
          regDate <= new Date(toDate) &&
          (!filters.user_status || u.user_status === filters.user_status)
        );
      });

      // Tổng hợp chi tiết cho từng user
      const userDetails = filteredUsers.map((user) => {
        const userOrders = (orders ?? []).filter(
          (o) => o.user_id === user.user_id && o.order_status === "Đã giao"
        );
        const totalSpent = userOrders.reduce((sum, o) => {
          const amount = Number(o.total_amount);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        return {
          user_id: user.user_id,
          user_name: user.user_name,
          email: user.user_email,
          phone: user.user_phone,
          user_status: user.user_status,
          registration_date: user.created_at,
          total_orders: userOrders.length,
          total_spent: totalSpent,
        };
      });

      preview = {
        report_type: "users",
        from_date: fromDate,
        to_date: toDate,
        total_value: userDetails.length,
        details: {
          total_users: userDetails.length,
          active_users: userDetails.filter((u) => u.user_status).length,
          inactive_users: userDetails.filter((u) => !u.user_status).length,
          users: userDetails,
        },
      };
    }

    if (reportType === "vouchers") {
      type Voucher = { voucher_status?: string; [key: string]: any };
      const vouchers = (await getAllVouchers?.()) as Voucher[] | undefined;
      const filteredVouchers = (vouchers ?? []).filter(
        (v) =>
          !filters.voucher_status || v.voucher_status === filters.voucher_status
      );
      preview = {
        report_type: "vouchers",
        from_date: fromDate,
        to_date: toDate,
        total_value: filteredVouchers.length,
        details: { vouchers: filteredVouchers },
      };
    }

    if (reportType === "blogs") {
      const blogs = await getAllBlogs?.();
      preview = {
        report_type: "blogs",
        from_date: fromDate,
        to_date: toDate,
        total_value: (blogs ?? []).length,
        details: { blogs: blogs ?? [] },
      };
    }

    setPreviewData(preview);
    setShowPreview(true);
  };

  // Khi lưu báo cáo, truyền previewData vào createReport
  const handleSaveReport = async () => {
    if (!previewData) return;
    const success = await createReport(
      previewData.report_type,
      previewData.from_date,
      previewData.to_date,
      filters,
      previewData.total_value,
      previewData.details
    );
    if (success) {
      alert("Lưu báo cáo thành công!");
      setShowPreview(false);
      setPreviewData(null);
    }
  };

  const handleDeleteReport = async (report_id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa báo cáo này?")) {
      await deleteReport(report_id);
    }
  };

  const handleExportExcel = (_report_id: number) => {
    // TODO: Implement Excel export
    alert("Tính năng xuất Excel đang được phát triển");
  };

  const handleExportPDF = (_report_id: number) => {
    // TODO: Implement PDF export
    alert("Tính năng xuất PDF đang được phát triển");
  };

  const renderReportTypeSelector = () => (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-900 mb-2">
        LOẠI BÁO CÁO
      </label>
      <select
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
        className="w-full px-4 py-3 border-2 border-black bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-black"
      >
        <option value="revenue">BÁO CÁO DOANH THU</option>
        <option value="orders">BÁO CÁO ĐƠN HÀNG</option>
        <option value="products">BÁO CÁO SẢN PHẨM</option>
        <option value="users">BÁO CÁO NGƯỜI DÙNG</option>
        <option value="vouchers">BÁO CÁO VOUCHER</option>
        <option value="blogs">BÁO CÁO BLOG</option>
      </select>
    </div>
  );

  const renderDateRange = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          TỪ NGÀY
        </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-full px-4 py-3 border-2 border-black bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          ĐÉN NGÀY
        </label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-full px-4 py-3 border-2 border-black bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>
    </div>
  );

  const renderFilters = () => {
    switch (reportType) {
      case "revenue":
      case "orders":
        return (
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              PHƯƠNG THỨC THANH TOÁN
            </label>
            <select
              value={filters.payment_method || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  payment_method: e.target.value || undefined,
                })
              }
              className="w-full px-4 py-3 border-2 border-black bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">TẤT CẢ</option>
              <option value="COD">COD</option>
              <option value="banking">CHUYỂN KHOẢN</option>
            </select>
          </div>
        );
      case "vouchers":
        return (
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              TRẠNG THÁI VOUCHER
            </label>
            <select
              value={filters.voucher_status || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  voucher_status: e.target.value || undefined,
                })
              }
              className="w-full px-4 py-3 border-2 border-black bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">TẤT CẢ</option>
              <option value="active">HOẠT ĐỘNG</option>
              <option value="inactive">NGƯNG HOẠT ĐỘNG</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPreview = () => {
    if (!previewData) return null;

    const details = previewData.details;

    return (
      <div className="bg-white border-4 border-black p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase">PREVIEW BÁO CÁO</h2>
          <div className="flex gap-3">
            <button
              onClick={handleSaveReport}
              disabled={loading}
              className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-400"
            >
              LƯU BÁO CÁO
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-3 border-2 border-black font-bold hover:bg-gray-100"
            >
              ĐÓNG
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border-2 border-black p-4">
            <div className="text-sm font-bold text-gray-600">LOẠI BÁO CÁO</div>
            <div className="text-xl font-black uppercase">{reportType}</div>
          </div>
          <div className="border-2 border-black p-4">
            <div className="text-sm font-bold text-gray-600">
              KHOẢNG THỜI GIAN
            </div>
            <div className="text-lg font-bold">
              {fromDate} - {toDate}
            </div>
          </div>
          <div className="border-2 border-black p-4">
            <div className="text-sm font-bold text-gray-600">GIÁ TRỊ TỔNG</div>
            <div className="text-xl font-black">
              {reportType === "revenue" || reportType === "products"
                ? formatVND(previewData.total_value)
                : previewData.total_value}
            </div>
          </div>
        </div>

        <div className="border-2 border-black p-6">
          <h3 className="text-xl font-black mb-4">CHI TIẾT</h3>
          {renderPreviewDetails(details)}
        </div>
      </div>
    );
  };

  const renderPreviewDetails = (details: any) => {
    switch (reportType) {
      case "revenue":
        return (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  TỔNG DOANH THU
                </div>
                <div className="text-2xl font-black">
                  {formatVND(details.total_revenue)}
                </div>
              </div>
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  SỐ ĐơN HÀNG
                </div>
                <div className="text-2xl font-black">{details.order_count}</div>
              </div>
            </div>
            <div className="border-2 border-black p-4">
              <h4 className="font-black mb-3">TOP 10 SẢN PHẨM BÁN CHẠY</h4>
              <table className="w-full">
                <thead className="border-b-2 border-black">
                  <tr>
                    <th className="text-left py-2 font-black">SẢN PHẨM</th>
                    <th className="text-right py-2 font-black">SỐ LƯỢNG</th>
                    <th className="text-right py-2 font-black">DOANH THU</th>
                  </tr>
                </thead>
                <tbody>
                  {details.top_products?.map((product: any, index: number) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2">{product.product_name}</td>
                      <td className="text-right py-2">
                        {product.total_quantity}
                      </td>
                      <td className="text-right py-2 font-bold">
                        {formatVND(product.total_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "orders":
        return (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  TỔNG ĐƠN HÀNG
                </div>
                <div className="text-2xl font-black">
                  {details.total_orders}
                </div>
              </div>
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600 mb-2">
                  THEO TRẠNG THÁI
                </div>
                {Object.entries(details.status_breakdown || {}).map(
                  ([status, data]: [string, any]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="font-bold uppercase">{status}:</span>
                      <span>{data.count}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );

      case "products":
        return (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  SẢN PHẨM ĐÃ BÁN
                </div>
                <div className="text-2xl font-black">
                  {details.total_products_sold}
                </div>
              </div>
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  TỔNG SỐ LƯỢNG
                </div>
                <div className="text-2xl font-black">
                  {details.total_quantity_sold}
                </div>
              </div>
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">DOANH THU</div>
                <div className="text-2xl font-black">
                  {formatVND(details.total_revenue)}
                </div>
              </div>
            </div>
            <div className="border-2 border-black p-4">
              <h4 className="font-black mb-3">SẢN PHẨM BÁN CHẠY NHẤT</h4>
              <table className="w-full">
                <thead className="border-b-2 border-black">
                  <tr>
                    <th className="text-left py-2 font-black">SẢN PHẨM</th>
                    <th className="text-left py-2 font-black">DANH MỤC</th>
                    <th className="text-right py-2 font-black">ĐÃ BÁN</th>
                    <th className="text-right py-2 font-black">DOANH THU</th>
                  </tr>
                </thead>
                <tbody>
                  {details.best_sellers?.map((product: any, index: number) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2">{product.product_name}</td>
                      <td className="py-2">{product.category}</td>
                      <td className="text-right py-2">{product.total_sold}</td>
                      <td className="text-right py-2 font-bold">
                        {formatVND(product.total_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "users":
        return (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  TỔNG NGƯỜI DÙNG
                </div>
                <div className="text-2xl font-black">{details.total_users}</div>
              </div>
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  ĐANG HOẠT ĐỘNG
                </div>
                <div className="text-2xl font-black">
                  {details.active_users}
                </div>
              </div>
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  NGƯNG HOẠT ĐỘNG
                </div>
                <div className="text-2xl font-black">
                  {details.inactive_users}
                </div>
              </div>
            </div>
            <div className="border-2 border-black p-4 mt-4">
              <h4 className="font-black mb-3">CHI TIẾT NGƯỜI DÙNG</h4>
              <table className="w-full">
                <thead className="border-b-2 border-black">
                  <tr>
                    <th className="text-left py-2 font-black">Tên</th>
                    <th className="text-left py-2 font-black">Email</th>
                    <th className="text-right py-2 font-black">Đơn đã giao</th>
                    <th className="text-right py-2 font-black">
                      Tổng Chi Tiêu
                    </th>
                    <th className="text-right py-2 font-black">Ngày Đăng Ký</th>
                    <th className="text-right py-2 font-black">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {details.users?.map((user: any) => (
                    <tr key={user.user_id} className="border-b border-gray-200">
                      <td className="py-2">{user.user_name}</td>
                      <td className="py-2">{user.email}</td>
                      <td className="text-right py-2">{user.total_orders}</td>
                      <td className="text-right py-2 font-bold">
                        {formatVND(user.total_spent)}
                      </td>
                      <td className="text-right py-2">
                        {user.registration_date
                          ? new Date(user.registration_date).toLocaleDateString(
                              "vi-VN"
                            )
                          : ""}
                      </td>
                      <td className="text-right py-2">
                        {user.user_status ? "Hoạt động" : "Ngưng"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "vouchers":
        return (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  TỔNG VOUCHER
                </div>
                <div className="text-2xl font-black">
                  {details.total_vouchers}
                </div>
              </div>
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  ĐANG HOẠT ĐỘNG
                </div>
                <div className="text-2xl font-black">
                  {details.active_vouchers}
                </div>
              </div>
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  TỔNG GIẢM GIÁ
                </div>
                <div className="text-2xl font-black">
                  {formatVND(details.total_discount_given)}
                </div>
              </div>
            </div>
          </div>
        );

      case "blogs":
        return (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">TỔNG BLOG</div>
                <div className="text-2xl font-black">{details.total_blogs}</div>
              </div>
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600 mb-2">
                  THEO THỂ THAO
                </div>
                {Object.entries(details.blogs_by_sport || {}).map(
                  ([sport, count]) => (
                    <div key={sport} className="flex justify-between text-sm">
                      <span className="font-bold">{sport}:</span>
                      <span>{count as number}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Không có dữ liệu</div>;
    }
  };

  const renderSavedReports = () => (
    <div className="bg-white border-4 border-black p-8">
      <h2 className="text-2xl font-black mb-6 uppercase">BÁO CÁO ĐÃ LƯU</h2>
      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có báo cáo nào được lưu
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div
              key={report.report_id}
              className="border-2 border-black p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black uppercase mb-2">
                    {report.report_type}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(report.from_date).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(report.to_date).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tạo:{" "}
                    {new Date(report.created_at).toLocaleDateString("vi-VN")}{" "}
                    bởi {report.created_by}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black mb-2">
                    {report.report_type === "revenue" ||
                    report.report_type === "products"
                      ? formatVND(report.total_value)
                      : report.total_value}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportExcel(report.report_id)}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-bold hover:bg-green-700"
                    >
                      EXCEL
                    </button>
                    <button
                      onClick={() => handleExportPDF(report.report_id)}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-bold hover:bg-red-700"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.report_id)}
                      className="px-4 py-2 bg-black text-white text-sm font-bold hover:bg-gray-800"
                    >
                      XÓA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black mb-10 uppercase text-center tracking-tight">
          BÁO CÁO QUẢN TRỊ
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center font-semibold">
            {error}
          </div>
        )}

        {/* Report Generator */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-10">
          <h2 className="text-2xl font-black mb-6 uppercase text-gray-900">
            TẠO BÁO CÁO MỚI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {renderReportTypeSelector()}
            {renderDateRange()}
          </div>
          {renderFilters()}

          <button
            onClick={handlePreview}
            disabled={loading}
            className="w-full px-6 py-4 bg-black text-white font-black text-lg rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors mt-4"
          >
            {loading ? "ĐANG XỬ LÝ..." : "XEM TRƯỚC BÁO CÁO"}
          </button>
        </div>

        {/* Preview Section */}
        {showPreview && <div className="mb-10">{renderPreview()}</div>}

        {/* Saved Reports */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          {renderSavedReports()}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
