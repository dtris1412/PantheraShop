import db from "../models/index.js";

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

export { createReport, getAllReports, getReportById, deleteReport };
