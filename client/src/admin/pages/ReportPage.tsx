import React, { useEffect, useState } from "react";
import {
  useAdminReport,
  ReportFilters,
  PreviewReportData,
  Report, // <-- add this import
} from "../contexts/reportContext";
import { formatVND } from "../../utils/format";
import { useOrder } from "../contexts/orderContext";
import { useAdmin } from "../contexts/adminContext";
import { useVoucher } from "../contexts/voucherContext";
import { useBlog } from "../contexts/blogContext";
import { useProduct } from "../contexts/productContext";
import { useInventory } from "../contexts/inventoryContext";

const ReportPage: React.FC = () => {
  const {
    reports,
    loading,
    error,
    getAllReports,
    createReport,
    deleteReport,
    getReportById,
    exportReportToExcel, // <-- thêm dòng này
  } = useAdminReport();
  const { getAllOrders } = useOrder();
  const { getAllUsers } = useAdmin();
  const { vouchers, getAllVouchers } = useVoucher();
  const { blogs, getAllBlogs } = useBlog();
  const { getAllProducts } = useProduct();
  const { products: inventoryProducts, fetchProducts } = useInventory();

  const [reportType, setReportType] = useState<string>("revenue");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [filters, setFilters] = useState<ReportFilters>({});
  const [previewData, setPreviewData] = useState<PreviewReportData | null>(
    null
  );
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

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
      const filteredOrders = (orders ?? []).filter((o) => {
        const orderDate = new Date(o.order_date);
        return (
          orderDate >= new Date(fromDate) &&
          orderDate <= new Date(toDate) &&
          o.order_status === "Đã giao" &&
          (!filters.payment_method ||
            o.payment_method?.toLowerCase() ===
              filters.payment_method?.toLowerCase())
        );
      });
      const totalRevenue = filteredOrders.reduce(
        (sum, o) => sum + (Number(o.total_amount) || 0),
        0
      );
      const orderCount = filteredOrders.length;

      // Top 10 sản phẩm bán chạy
      const productStats: Record<
        string,
        { product_name: string; total_quantity: number; total_revenue: number }
      > = {};
      filteredOrders.forEach((o: any) => {
        (o.orderProducts ?? []).forEach((prod: any) => {
          const key = prod.product_id;
          if (!productStats[key]) {
            productStats[key] = {
              product_name: prod.product_name,
              total_quantity: 0,
              total_revenue: 0,
            };
          }
          productStats[key].total_quantity += prod.quantity || 0;
          productStats[key].total_revenue += prod.total_price || 0;
        });
      });
      const top_products = Object.values(productStats)
        .sort((a, b) => b.total_quantity - a.total_quantity)
        .slice(0, 10);

      // Mapping chi tiết đơn hàng giống báo cáo đơn hàng
      const orderDetails = filteredOrders.map((o: any) => ({
        order_id: o.order_id,
        user_name: o.recipient_name || o.User?.user_name || "",
        total_amount: Number(o.total_amount) || 0,
        order_status: o.order_status,
        order_date: o.order_date,
        payment_method: o.Payment?.payment_method || "",
        payment_status: o.Payment?.payment_status || "",
        recipient_address: o.recipient_address,
        recipient_phone: o.recipient_phone,
        voucher_id: o.voucher_id,
        orderProducts: o.orderProducts ?? [],
        notes: o.notes,
      }));

      preview = {
        report_type: "revenue",
        from_date: fromDate,
        to_date: toDate,
        total_value: totalRevenue,
        details: {
          orders: orderDetails, // <-- dùng orderDetails đã mapping payment
          total_revenue: totalRevenue,
          order_count: orderCount,
          top_products,
        },
      };
    }

    if (reportType === "orders") {
      const orders = await getAllOrders?.();
      // ép kiểu nếu cần: as any[]
      const filteredOrders = (orders ?? []).filter((o: any) => {
        const orderDate = new Date(o.order_date);
        // Lọc theo payment_method từ o.Payment.payment_method
        return (
          orderDate >= new Date(fromDate) &&
          orderDate <= new Date(toDate) &&
          (!filters.order_status || o.order_status === filters.order_status) &&
          (!filters.payment_method ||
            o.Payment?.payment_method?.toLowerCase() ===
              filters.payment_method.toLowerCase())
        );
      });

      // Tổng hợp breakdown theo trạng thái
      const status_breakdown: Record<string, { count: number; total: number }> =
        {};
      filteredOrders.forEach((o: any) => {
        const status = o.order_status || "Khác";
        if (!status_breakdown[status]) {
          status_breakdown[status] = { count: 0, total: 0 };
        }
        status_breakdown[status].count += 1;
        status_breakdown[status].total += Number(o.total_amount) || 0;
      });

      // Chi tiết từng đơn hàng
      const orderDetails = filteredOrders.map((o: any) => ({
        order_id: o.order_id,
        user_name: o.recipient_name || o.User?.user_name || "",
        total_amount: Number(o.total_amount) || 0,
        order_status: o.order_status,
        order_date: o.order_date,
        payment_method: o.Payment?.payment_method || "",
        payment_status: o.Payment?.payment_status || "",
        recipient_address: o.recipient_address,
        recipient_phone: o.recipient_phone,
        voucher_id: o.voucher_id,
        orderProducts: o.orderProducts ?? [],
        notes: o.notes,
      }));

      preview = {
        report_type: "orders",
        from_date: fromDate,
        to_date: toDate,
        total_value: filteredOrders.length,
        details: {
          total_orders: filteredOrders.length,
          status_breakdown,
          orders: orderDetails,
        },
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
      if (vouchers.length === 0) {
        await getAllVouchers();
      }
      const voucherList = vouchers;
      const filteredVouchers = (voucherList ?? []).filter((v) => {
        const createdDate = v.created_at ? new Date(v.created_at) : null;
        const from = new Date(fromDate);
        const to = new Date(toDate);
        // Lọc theo khoảng thời gian created_at
        const inRange = createdDate
          ? createdDate >= from && createdDate <= to
          : false;
        // Lọc theo trạng thái nếu có
        const statusMatch =
          !filters.voucher_status ||
          v.voucher_status === filters.voucher_status;
        return inRange && statusMatch;
      });
      const total_vouchers = filteredVouchers.length;
      const active_vouchers = filteredVouchers.filter(
        (v) => v.voucher_status === "active"
      ).length;
      const inactive_vouchers = filteredVouchers.filter(
        (v) => v.voucher_status === "inactive"
      ).length;
      const total_discount_given = filteredVouchers.reduce(
        (sum, v) => sum + (Number(v.discount_value) || 0),
        0
      );
      preview = {
        report_type: "vouchers",
        from_date: fromDate,
        to_date: toDate,
        total_value: total_vouchers,
        details: {
          vouchers: filteredVouchers,
          total_vouchers,
          active_vouchers,
          inactive_vouchers,
          total_discount_given,
        },
      };
    }

    if (reportType === "blogs") {
      if (blogs.length === 0) {
        await getAllBlogs();
      }
      const blogList = blogs;
      // Lọc theo khoảng thời gian created_at
      const filteredBlogs = (blogList ?? []).filter((b) => {
        const createdDate = b.created_at ? new Date(b.created_at) : null;
        const from = new Date(fromDate);
        const to = new Date(toDate);
        return createdDate ? createdDate >= from && createdDate <= to : false;
      });

      // Tổng hợp theo thể thao
      const blogs_by_sport: Record<string, number> = {};
      filteredBlogs.forEach((b) => {
        const sportName = b.Sport?.sport_name || "Khác";
        blogs_by_sport[sportName] = (blogs_by_sport[sportName] || 0) + 1;
      });

      preview = {
        report_type: "blogs",
        from_date: fromDate,
        to_date: toDate,
        total_value: filteredBlogs.length,
        details: {
          blogs: filteredBlogs,
          total_blogs: filteredBlogs.length,
          blogs_by_sport,
        },
      };
    }

    if (reportType === "inventory") {
      if (inventoryProducts.length === 0) {
        await fetchProducts();
      }
      const from = new Date(fromDate);
      const to = new Date(toDate);

      // Gom tất cả variant từ các sản phẩm
      const allVariants = inventoryProducts.flatMap((p) =>
        Array.isArray(p.Variant) ? p.Variant : []
      );

      const filteredVariants = allVariants.filter((v: any) => {
        if (!v.updated_at) return false;
        const updated = new Date(v.updated_at);
        return updated >= from && updated <= to;
      });

      preview = {
        report_type: "inventory",
        from_date: fromDate,
        to_date: toDate,
        total_value: filteredVariants.length,
        details: {
          variants: filteredVariants,
          total_variants: filteredVariants.length,
        },
      };
    }

    if (reportType === "warehouse") {
      // Nhập kho
      if (inventoryProducts.length === 0) {
        await fetchProducts();
      }
      const allVariants = inventoryProducts.flatMap((p) =>
        Array.isArray(p.Variant) ? p.Variant : []
      );

      // Xuất kho
      const orders = await getAllOrders?.();
      const exportedProducts: Record<
        string,
        {
          product_name: string;
          variant_id: number | string;
          variant_size?: string;
          variant_color?: string;
          total_exported: number;
          last_exported_at?: string;
        }
      > = {};

      (orders ?? []).forEach((order: any) => {
        (order.orderProducts ?? []).forEach((op: any) => {
          const v = op.Variant;
          const key = `${v.variant_id}`;
          if (!exportedProducts[key]) {
            exportedProducts[key] = {
              product_name: v.Product?.product_name || v.product_name || "",
              variant_id: v.variant_id,
              variant_size: v.variant_size,
              variant_color: v.variant_color,
              total_exported: 0,
              last_exported_at: order.order_date,
            };
          }
          exportedProducts[key].total_exported += Number(op.quantity) || 0;
          // Cập nhật ngày xuất gần nhất
          if (
            !exportedProducts[key].last_exported_at ||
            new Date(order.order_date) >
              new Date(exportedProducts[key].last_exported_at)
          ) {
            exportedProducts[key].last_exported_at = order.order_date;
          }
        });
      });

      // Tính tổng số lượng xuất kho
      const total_exported_quantity = Object.values(exportedProducts).reduce(
        (sum, v: any) => sum + (Number(v.total_exported) || 0),
        0
      );

      preview = {
        report_type: "warehouse",
        from_date: fromDate,
        to_date: toDate,
        total_value:
          filters.warehouse_type === "export"
            ? total_exported_quantity
            : allVariants.length,
        details: {
          imported_variants: allVariants,
          exported_variants: Object.values(exportedProducts),
          total_exported_quantity, // <-- thêm vào details để dùng ở UI
          warehouse_type: filters.warehouse_type || "import",
        },
      };
    }

    setPreviewData(preview);
    setShowPreview(true);
  };

  const getReportTypeLabel = (type: string, warehouseType?: string) => {
    switch (type) {
      case "revenue":
        return "Doanh thu";
      case "orders":
        return "Đơn hàng";
      case "products":
        return "Sản phẩm";
      case "users":
        return "Người dùng";
      case "vouchers":
        return "Voucher";
      case "blogs":
        return "Blog";
      case "inventory":
        return "Nhập kho";
      case "warehouse":
        if (warehouseType === "import") return "Kho - Nhập";
        if (warehouseType === "export") return "Kho - Xuất";
        return "Kho";
      default:
        return type;
    }
  };

  // Khi lưu báo cáo, truyền previewData vào createReport
  const handleSaveReport = async () => {
    if (!previewData) return;
    let detailsToSave = previewData.details;
    let reportTypeLabel = getReportTypeLabel(
      previewData.report_type,
      detailsToSave.warehouse_type
    );
    // Nếu là báo cáo warehouse thì chỉ lưu đúng loại chi tiết
    if (previewData.report_type === "warehouse") {
      if (detailsToSave.warehouse_type === "import") {
        detailsToSave = {
          warehouse_type: "import",
          imported_variants: detailsToSave.imported_variants,
          total_imported: detailsToSave.imported_variants?.length || 0,
        };
      } else if (detailsToSave.warehouse_type === "export") {
        detailsToSave = {
          warehouse_type: "export",
          exported_variants: detailsToSave.exported_variants,
          total_exported_quantity: detailsToSave.total_exported_quantity || 0,
        };
      }
    }
    const success = await createReport(
      reportTypeLabel, // <-- dùng tên tiếng Việt
      previewData.from_date,
      previewData.to_date,
      filters,
      previewData.total_value,
      detailsToSave
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

  const handleExportExcel = async (report_id: number) => {
    await exportReportToExcel(report_id);
  };

  const handleExportPDF = (_report_id: number) => {
    // TODO: Implement PDF export
    alert("Tính năng xuất PDF đang được phát triển");
  };

  const handleViewReport = async (report_id: number) => {
    const report = await getReportById(report_id);
    console.log("Report details received:", report); // <-- Add this line for debugging
    if (report) {
      setSelectedReport(report);
    }
  };

  const handleCloseReportDetail = () => {
    setSelectedReport(null);
  };

  const renderReportDetail = () => {
    if (!selectedReport) return null;
    let details: any = selectedReport.details;
    // Parse nhiều lần nếu cần
    let parseCount = 0;
    while (typeof details === "string" && parseCount < 5) {
      try {
        details = JSON.parse(details);
        parseCount++;
      } catch {
        break;
      }
    }
    // Log để kiểm tra dữ liệu thực tế
    console.log("Parsed details for report:", details);

    // Nếu là báo cáo kho xuất, kiểm tra exported_variants
    if (
      selectedReport.report_type?.toLowerCase().includes("xuất") &&
      (!details.exported_variants || !Array.isArray(details.exported_variants))
    ) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black p-8 max-w-5xl w-full relative">
            <button
              onClick={handleCloseReportDetail}
              className="absolute top-4 right-4 px-4 py-2 border-2 border-black font-bold hover:bg-gray-100"
            >
              ĐÓNG
            </button>
            <h2 className="text-2xl font-black uppercase mb-6">
              CHI TIẾT BÁO CÁO
            </h2>
            <div className="mb-4">Không có dữ liệu chi tiết xuất kho.</div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div
          className="bg-white border-4 border-black p-8 max-w-5xl w-full relative"
          style={{ maxHeight: "90vh", overflow: "auto" }} // Sửa ở đây
        >
          <button
            onClick={handleCloseReportDetail}
            className="absolute top-4 right-4 px-4 py-2 border-2 border-black font-bold hover:bg-gray-100"
          >
            ĐÓNG
          </button>
          <h2 className="text-2xl font-black uppercase mb-6">
            CHI TIẾT BÁO CÁO
          </h2>
          <div className="mb-4">
            <div className="font-bold">Loại báo cáo:</div>
            <div>{selectedReport.report_type}</div>
          </div>
          <div className="mb-4">
            <div className="font-bold">Thời gian:</div>
            <div>
              {selectedReport.from_date} - {selectedReport.to_date}
            </div>
          </div>
          <div className="mb-4">
            <div className="font-bold">Giá trị tổng:</div>
            <div>{selectedReport.total_value}</div>
          </div>
          <div
            className="border-2 border-black p-4"
            style={{ maxHeight: "60vh", overflowY: "auto" }} // Tăng chiều cao chi tiết
          >
            <h3 className="font-black mb-3">Chi tiết</h3>
            {renderPreviewDetails(details, selectedReport.report_type)}
          </div>
        </div>
      </div>
    );
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
        <option value="inventory">BÁO CÁO NHẬP KHO</option>
        <option value="warehouse">BÁO CÁO XUẤT NHẬP KHO</option>
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
          ĐẾN NGÀY
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
              <option value="banking">MOMO</option>
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
      case "warehouse":
        return (
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              CHỌN LOẠI XUẤT/NHẬP KHO
            </label>
            <select
              value={filters.warehouse_type || "import"}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  warehouse_type: e.target.value as "import" | "export",
                })
              }
              className="w-full px-4 py-3 border-2 border-black bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="import">NHẬP KHO</option>
              <option value="export">XUẤT KHO</option>
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

  const normalizeReportType = (type: string) => {
    switch (type) {
      case "Doanh thu":
        return "revenue";
      case "Đơn hàng":
        return "orders";
      case "Sản phẩm":
        return "products";
      case "Người dùng":
        return "users";
      case "Voucher":
        return "vouchers";
      case "Blog":
        return "blogs";
      case "Nhập kho":
        return "inventory";
      case "Kho - Nhập":
        return "warehouse";
      case "Kho - Xuất":
        return "warehouse";
      default:
        return type;
    }
  };

  const renderPreviewDetails = (details: any, type?: string) => {
    const currentType = normalizeReportType(type || reportType);
    switch (currentType) {
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
                  SỐ ĐƠN HÀNG
                </div>
                <div className="text-2xl font-black">{details.order_count}</div>
              </div>
            </div>
            <div className="border-2 border-black p-4">
              <h4 className="font-black mb-3">CHI TIẾT ĐƠN HÀNG</h4>
              <table className="w-full">
                <thead className="border-b-2 border-black">
                  <tr>
                    <th className="text-left py-2 font-black">Mã Đơn</th>
                    <th className="text-left py-2 font-black">Khách</th>
                    <th className="text-right py-2 font-black">Tổng Tiền</th>
                    <th className="text-right py-2 font-black">Trạng Thái</th>
                    <th className="text-right py-2 font-black">Ngày Tạo</th>
                    <th className="text-right py-2 font-black">Thanh Toán</th>
                  </tr>
                </thead>
                <tbody>
                  {details.orders?.map((o: any) => (
                    <tr key={o.order_id} className="border-b border-gray-200">
                      <td className="py-2">{o.order_id}</td>
                      <td className="py-2">{o.user_name}</td>
                      <td className="text-right py-2 font-bold">
                        {formatVND(o.total_amount)}
                      </td>
                      <td className="text-right py-2">{o.order_status}</td>
                      <td className="text-right py-2">
                        {o.order_date
                          ? new Date(o.order_date).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                      <td className="text-right py-2">{o.payment_method}</td>
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
                      <span>
                        {data.count} ({formatVND(data.total)})
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="border-2 border-black p-4 mt-4">
              <h4 className="font-black mb-3">CHI TIẾT ĐƠN HÀNG</h4>
              <table className="w-full">
                <thead className="border-b-2 border-black">
                  <tr>
                    <th className="text-left py-2 font-black">Mã Đơn</th>
                    <th className="text-left py-2 font-black">Khách</th>
                    <th className="text-right py-2 font-black">Tổng Tiền</th>
                    <th className="text-right py-2 font-black">Trạng Thái</th>
                    <th className="text-right py-2 font-black">Ngày Tạo</th>
                    <th className="text-right py-2 font-black">Thanh Toán</th>
                  </tr>
                </thead>
                <tbody>
                  {details.orders?.map((o: any) => (
                    <tr key={o.order_id} className="border-b border-gray-200">
                      <td className="py-2">{o.order_id}</td>
                      <td className="py-2">{o.user_name}</td>
                      <td className="text-right py-2 font-bold">
                        {formatVND(o.total_amount)}
                      </td>
                      <td className="text-right py-2">{o.order_status}</td>
                      <td className="text-right py-2">
                        {o.order_date
                          ? new Date(o.order_date).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                      <td className="text-right py-2">{o.payment_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "products":
        return (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  TỔNG SẢN PHẨM
                </div>
                <div className="text-2xl font-black">
                  {details.products?.length ?? 0}
                </div>
              </div>
              {/* Có thể bổ sung thêm các thống kê khác nếu cần */}
            </div>
            <div className="border-2 border-black p-4 mt-4">
              <h4 className="font-black mb-3">CHI TIẾT SẢN PHẨM</h4>
              <table className="w-full">
                <thead className="border-b-2 border-black">
                  <tr>
                    <th className="text-left py-2 font-black">Tên sản phẩm</th>
                    <th className="text-left py-2 font-black">Danh mục</th>
                    <th className="text-right py-2 font-black">Giá bán</th>
                    <th className="text-right py-2 font-black">Tồn kho</th>
                    <th className="text-right py-2 font-black">Ngày tạo</th>
                    <th className="text-right py-2 font-black">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {details.products?.map((p: any) => (
                    <tr key={p.product_id} className="border-b border-gray-200">
                      <td className="py-2">{p.product_name}</td>
                      <td className="py-2">
                        {p.Category?.category_name || ""}
                      </td>
                      <td className="text-right py-2 font-bold">
                        {formatVND(p.product_price)}
                      </td>
                      <td className="text-right py-2">{p.stock}</td>
                      <td className="text-right py-2">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                      <td className="text-right py-2">
                        {p.is_active ? "Hoạt động" : "Ngưng"}
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
            <div className="border-2 border-black p-4 mt-4">
              <h4 className="font-black mb-3">CHI TIẾT VOUCHER</h4>
              <table className="w-full">
                <thead className="border-b-2 border-black">
                  <tr>
                    <th className="text-left py-2 font-black">Mã Voucher</th>
                    <th className="text-left py-2 font-black">Loại</th>
                    <th className="text-right py-2 font-black">Giá trị giảm</th>
                    <th className="text-right py-2 font-black">
                      Đơn tối thiểu
                    </th>
                    <th className="text-right py-2 font-black">Ngày bắt đầu</th>
                    <th className="text-right py-2 font-black">
                      Ngày kết thúc
                    </th>
                    <th className="text-right py-2 font-black">Số lượt dùng</th>
                    <th className="text-right py-2 font-black">Giới hạn</th>
                    <th className="text-right py-2 font-black">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {details.vouchers?.map((v: any) => (
                    <tr key={v.voucher_id} className="border-b border-gray-200">
                      <td className="py-2">{v.voucher_code}</td>
                      <td className="py-2">{v.discount_type}</td>
                      <td className="text-right py-2 font-bold">
                        {formatVND(v.discount_value)}
                      </td>
                      <td className="text-right py-2">
                        {formatVND(v.min_order_value)}
                      </td>
                      <td className="text-right py-2">
                        {v.start_date
                          ? new Date(v.start_date).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                      <td className="text-right py-2">
                        {v.end_date
                          ? new Date(v.end_date).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                      <td className="text-right py-2">{v.used_count}</td>
                      <td className="text-right py-2">{v.usage_limit}</td>
                      <td className="text-right py-2">
                        {v.voucher_status === "active" ? "Hoạt động" : "Ngưng"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <div className="border-2 border-black p-4 mt-4">
              <h4 className="font-black mb-3">CHI TIẾT BLOG</h4>
              <table className="w-full">
                <thead className="border-b-2 border-black">
                  <tr>
                    <th className="text-left py-2 font-black">Tiêu đề</th>
                    <th className="text-left py-2 font-black">Người viết</th>
                    <th className="text-left py-2 font-black">Thể thao</th>
                    <th className="text-left py-2 font-black">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {details.blogs?.map((b: any) => (
                    <tr key={b.blog_id} className="border-b border-gray-200">
                      <td className="py-2">{b.blog_title}</td>
                      <td className="py-2">{b.User?.user_name || ""}</td>
                      <td className="py-2">{b.Sport?.sport_name || "Khác"}</td>
                      <td className="py-2">
                        {b.created_at
                          ? new Date(b.created_at).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "inventory":
        return (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border-2 border-black p-4">
                <div className="text-sm font-bold text-gray-600">
                  TỔNG BIẾN THỂ NHẬP KHO
                </div>
                <div className="text-2xl font-black">
                  {details.total_variants}
                </div>
              </div>
            </div>
            <div className="border-2 border-black p-4 mt-4">
              <h4 className="font-black mb-3">CHI TIẾT NHẬP KHO</h4>
              <table className="w-full">
                <thead className="border-b-2 border-black">
                  <tr>
                    <th className="text-left py-2 font-black">Tên sản phẩm</th>
                    <th className="text-left py-2 font-black">Màu</th>
                    <th className="text-left py-2 font-black">Size</th>
                    <th className="text-right py-2 font-black">Tồn kho</th>
                    <th className="text-right py-2 font-black">
                      Ngày cập nhật
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {details.variants?.map((v: any) => (
                    <tr key={v.variant_id} className="border-b border-gray-200">
                      <td className="py-2">{v.product_name}</td>
                      <td className="py-2">{v.variant_color}</td>
                      <td className="py-2">{v.variant_size}</td>
                      <td className="text-right py-2">{v.variant_stock}</td>
                      <td className="text-right py-2">
                        {v.updated_at
                          ? new Date(v.updated_at).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "warehouse":
        return (
          <div>
            {details.warehouse_type === "export" && (
              <div className="border-2 border-black p-4 mt-4">
                <h4 className="font-black mb-3">CHI TIẾT XUẤT KHO</h4>
                <table className="w-full">
                  <thead className="border-b-2 border-black">
                    <tr>
                      <th className="text-left py-2 font-black">
                        Tên sản phẩm
                      </th>
                      <th className="text-left py-2 font-black">Màu</th>
                      <th className="text-left py-2 font-black">Size</th>
                      <th className="text-right py-2 font-black">Tổng xuất</th>
                      <th className="text-right py-2 font-black">
                        Ngày xuất gần nhất
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.exported_variants?.map((v: any) => (
                      <tr
                        key={v.variant_id}
                        className="border-b border-gray-200"
                      >
                        <td className="py-2">{v.product_name}</td>
                        <td className="py-2">{v.variant_color}</td>
                        <td className="py-2">{v.variant_size}</td>
                        <td className="text-right py-2">{v.total_exported}</td>
                        <td className="text-right py-2">
                          {v.last_exported_at
                            ? new Date(v.last_exported_at).toLocaleDateString(
                                "vi-VN"
                              )
                            : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {(details.warehouse_type === "import" ||
              !details.warehouse_type) && (
              <div className="border-2 border-black p-4 mt-4">
                <h4 className="font-black mb-3">CHI TIẾT NHẬP KHO</h4>
                <table className="w-full">
                  <thead className="border-b-2 border-black">
                    <tr>
                      <th className="text-left py-2 font-black">
                        Tên sản phẩm
                      </th>
                      <th className="text-left py-2 font-black">Màu</th>
                      <th className="text-left py-2 font-black">Size</th>
                      <th className="text-right py-2 font-black">Tồn kho</th>
                      <th className="text-right py-2 font-black">Ngày nhập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.imported_variants?.map((v: any) => (
                      <tr
                        key={v.variant_id}
                        className="border-b border-gray-200"
                      >
                        <td className="py-2">
                          {v.Product?.product_name || v.product_name || ""}
                        </td>
                        <td className="py-2">{v.variant_color}</td>
                        <td className="py-2">{v.variant_size}</td>
                        <td className="text-right py-2">{v.variant_stock}</td>
                        <td className="text-right py-2">
                          {v.created_at
                            ? new Date(v.created_at).toLocaleDateString("vi-VN")
                            : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                      onClick={() => handleDeleteReport(report.report_id)}
                      className="px-4 py-2 bg-black text-white text-sm font-bold hover:bg-gray-800"
                    >
                      XÓA
                    </button>
                    <button
                      onClick={() => handleViewReport(report.report_id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
                    >
                      XEM CHI TIẾT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Đưa modal ra ngoài vòng lặp, chỉ render một lần */}
      {renderReportDetail()}
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
