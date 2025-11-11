import db from "../models/index.js";
import ExcelJS from "exceljs";

const { Report } = db;

// Create report with pre-computed data from frontend
const createReport = async (
  reportType,
  fromDate,
  toDate,
  filters,
  totalValue,
  details,
  createdBy
) => {
  try {
    const report = await Report.create({
      report_type: reportType,
      from_date: new Date(fromDate),
      to_date: new Date(toDate),
      filters: JSON.stringify(filters || {}),
      total_value: totalValue,
      details: JSON.stringify(details),
      description: `${reportType} report from ${fromDate} to ${toDate}`,
      created_by: createdBy,
      created_at: new Date(),
    });

    return { success: true, data: report };
  } catch (error) {
    console.error("Error creating report:", error);
    return { success: false, message: error.message };
  }
};

// Get all reports
const getAllReports = async () => {
  try {
    const reports = await Report.findAll({
      order: [["created_at", "DESC"]],
    });
    return { success: true, data: reports };
  } catch (error) {
    console.error("Error getting reports:", error);
    return { success: false, message: error.message };
  }
};

// Get report by ID
const getReportById = async (reportId) => {
  try {
    const report = await Report.findByPk(reportId);
    if (!report) {
      return { success: false, message: "Report not found" };
    }
    return { success: true, data: report };
  } catch (error) {
    console.error("Error getting report:", error);
    return { success: false, message: error.message };
  }
};

// Delete report
const deleteReport = async (reportId) => {
  try {
    const report = await Report.findByPk(reportId);
    if (!report) {
      return { success: false, message: "Report not found" };
    }
    await report.destroy();
    return { success: true, message: "Report deleted successfully" };
  } catch (error) {
    console.error("Error deleting report:", error);
    return { success: false, message: error.message };
  }
};

const exportReportToExcel = async (report_id) => {
  try {
    const report = await Report.findByPk(report_id);
    if (!report) throw new Error("Report not found");
    let details = report.details;
    let parseCount = 0;
    while (typeof details === "string" && parseCount < 5) {
      try {
        details = JSON.parse(details);
        parseCount++;
      } catch {
        break;
      }
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

    worksheet.addRow(["Loại báo cáo", report.report_type]);
    worksheet.addRow(["Thời gian", `${report.from_date} - ${report.to_date}`]);
    worksheet.addRow(["Giá trị tổng", report.total_value]);
    worksheet.addRow([]);
    worksheet.addRow(["Chi tiết"]);

    // Xuất chi tiết theo từng loại báo cáo
    switch (report.report_type) {
      case "Doanh thu":
        worksheet.addRow(["TỔNG DOANH THU", details.total_revenue]);
        worksheet.addRow(["SỐ ĐƠN HÀNG", details.order_count]);
        worksheet.addRow([]);
        worksheet.addRow(["TOP 10 SẢN PHẨM BÁN CHẠY"]);
        worksheet.addRow(["Tên sản phẩm", "Số lượng", "Doanh thu"]);
        (details.top_products || []).forEach((p) => {
          worksheet.addRow([p.product_name, p.total_quantity, p.total_revenue]);
        });
        worksheet.addRow([]);
        worksheet.addRow([
          "Mã Đơn",
          "Khách",
          "Tổng Tiền",
          "Trạng Thái",
          "Ngày Tạo",
          "Thanh Toán",
        ]);
        (details.orders || []).forEach((o) => {
          worksheet.addRow([
            o.order_id,
            o.user_name,
            o.total_amount,
            o.order_status,
            o.order_date,
            o.payment_method,
          ]);
        });
        break;

      case "Đơn hàng":
        worksheet.addRow(["TỔNG ĐƠN HÀNG", details.total_orders]);
        worksheet.addRow([]);
        worksheet.addRow(["THEO TRẠNG THÁI"]);
        worksheet.addRow(["Trạng thái", "Số lượng", "Tổng tiền"]);
        Object.entries(details.status_breakdown || {}).forEach(
          ([status, data]) => {
            worksheet.addRow([status, data.count, data.total]);
          }
        );
        worksheet.addRow([]);
        worksheet.addRow([
          "Mã Đơn",
          "Khách",
          "Tổng Tiền",
          "Trạng Thái",
          "Ngày Tạo",
          "Thanh Toán",
        ]);
        (details.orders || []).forEach((o) => {
          worksheet.addRow([
            o.order_id,
            o.user_name,
            o.total_amount,
            o.order_status,
            o.order_date,
            o.payment_method,
          ]);
        });
        break;

      case "Sản phẩm":
        worksheet.addRow(["TỔNG SẢN PHẨM", (details.products || []).length]);
        worksheet.addRow([]);
        worksheet.addRow([
          "Tên sản phẩm",
          "Danh mục",
          "Giá bán",
          "Tồn kho",
          "Ngày tạo",
          "Trạng thái",
        ]);
        (details.products || []).forEach((p) => {
          worksheet.addRow([
            p.product_name,
            p.Category?.category_name || "",
            p.product_price,
            p.stock,
            p.created_at,
            p.is_active ? "Hoạt động" : "Ngưng",
          ]);
        });
        break;

      case "Người dùng":
        worksheet.addRow(["TỔNG NGƯỜI DÙNG", details.total_users]);
        worksheet.addRow(["ĐANG HOẠT ĐỘNG", details.active_users]);
        worksheet.addRow(["NGƯNG HOẠT ĐỘNG", details.inactive_users]);
        worksheet.addRow([]);
        worksheet.addRow([
          "Tên",
          "Email",
          "Đơn đã giao",
          "Tổng Chi Tiêu",
          "Ngày Đăng Ký",
          "Trạng Thái",
        ]);
        (details.users || []).forEach((u) => {
          worksheet.addRow([
            u.user_name,
            u.email,
            u.total_orders,
            u.total_spent,
            u.registration_date,
            u.user_status ? "Hoạt động" : "Ngưng",
          ]);
        });
        break;

      case "Voucher":
        worksheet.addRow(["TỔNG VOUCHER", details.total_vouchers]);
        worksheet.addRow(["ĐANG HOẠT ĐỘNG", details.active_vouchers]);
        worksheet.addRow(["TỔNG GIẢM GIÁ", details.total_discount_given]);
        worksheet.addRow([]);
        worksheet.addRow([
          "Mã Voucher",
          "Loại",
          "Giá trị giảm",
          "Đơn tối thiểu",
          "Ngày bắt đầu",
          "Ngày kết thúc",
          "Số lượt dùng",
          "Giới hạn",
          "Trạng thái",
        ]);
        (details.vouchers || []).forEach((v) => {
          worksheet.addRow([
            v.voucher_code,
            v.discount_type,
            v.discount_value,
            v.min_order_value,
            v.start_date,
            v.end_date,
            v.used_count,
            v.usage_limit,
            v.voucher_status === "active" ? "Hoạt động" : "Ngưng",
          ]);
        });
        break;

      case "Blog":
        worksheet.addRow(["TỔNG BLOG", details.total_blogs]);
        worksheet.addRow([]);
        worksheet.addRow(["THEO THỂ THAO"]);
        worksheet.addRow(["Thể thao", "Số lượng"]);
        Object.entries(details.blogs_by_sport || {}).forEach(
          ([sport, count]) => {
            worksheet.addRow([sport, count]);
          }
        );
        worksheet.addRow([]);
        worksheet.addRow(["Tiêu đề", "Người viết", "Thể thao", "Ngày tạo"]);
        (details.blogs || []).forEach((b) => {
          worksheet.addRow([
            b.blog_title,
            b.User?.user_name || "",
            b.Sport?.sport_name || "Khác",
            b.created_at,
          ]);
        });
        break;

      case "Nhập kho":
        worksheet.addRow(["TỔNG BIẾN THỂ NHẬP KHO", details.total_variants]);
        worksheet.addRow([]);
        worksheet.addRow([
          "Tên sản phẩm",
          "Màu",
          "Size",
          "Tồn kho",
          "Ngày cập nhật",
        ]);
        (details.variants || []).forEach((v) => {
          worksheet.addRow([
            v.product_name,
            v.variant_color,
            v.variant_size,
            v.variant_stock,
            v.updated_at,
          ]);
        });
        break;

      case "Kho - Nhập":
        worksheet.addRow(["TỔNG NHẬP KHO", details.total_imported]);
        worksheet.addRow([]);
        worksheet.addRow([
          "Tên sản phẩm",
          "Màu",
          "Size",
          "Tồn kho",
          "Ngày nhập",
        ]);
        (details.imported_variants || []).forEach((v) => {
          worksheet.addRow([
            v.Product?.product_name || v.product_name || "",
            v.variant_color,
            v.variant_size,
            v.variant_stock,
            v.created_at,
          ]);
        });
        break;

      case "Kho - Xuất":
        worksheet.addRow(["TỔNG XUẤT KHO", details.total_exported_quantity]);
        worksheet.addRow([]);
        worksheet.addRow([
          "Tên sản phẩm",
          "Màu",
          "Size",
          "Tổng xuất",
          "Ngày xuất gần nhất",
        ]);
        (details.exported_variants || []).forEach((v) => {
          worksheet.addRow([
            v.product_name,
            v.variant_color,
            v.variant_size,
            v.total_exported,
            v.last_exported_at,
          ]);
        });
        break;

      default:
        worksheet.addRow(["Không có dữ liệu"]);
        break;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw error;
  }
};

export {
  createReport,
  getAllReports,
  getReportById,
  deleteReport,
  exportReportToExcel,
};
