import {
  createReport as createReportService,
  getAllReports as getAllReportsService,
  getReportById as getReportByIdService,
  deleteReport as deleteReportService,
  exportReportToExcel as exportReportToExcelService,
} from "../../shared/services/reportService.js";

const exportReportToExcel = async (req, res) => {
  try {
    const { report_id } = req.params;
    const buffer = await exportReportToExcelService(report_id);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report_${report_id}.xlsx`
    );
    res.send(buffer);
  } catch (err) {
    console.error("Error in exportReportToExcel controller:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Tạo báo cáo (nhận dữ liệu đã tổng hợp từ frontend)
const createReport = async (req, res) => {
  try {
    const { report_type, from_date, to_date, filters, total_value, details } =
      req.body;
    const createdBy = req.user?.user_name || "admin";

    if (!report_type || !from_date || !to_date || !details) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: report_type, from_date, to_date, details",
      });
    }

    const result = await createReportService(
      report_type,
      from_date,
      to_date,
      filters,
      total_value,
      details,
      createdBy
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in createReport controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllReports = async (req, res) => {
  try {
    const result = await getAllReportsService();
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllReports controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const { report_id } = req.params;
    const result = await getReportByIdService(report_id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getReportById controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { report_id } = req.params;
    const result = await deleteReportService(report_id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteReport controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  createReport,
  getAllReports,
  getReportById,
  deleteReport,
  exportReportToExcel,
};
