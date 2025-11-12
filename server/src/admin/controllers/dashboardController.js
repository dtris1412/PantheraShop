import {
  getDashboardStats as getDashboardStatsService,
  getUserStatsByMonth as getUserStatsByMonthService,
  getOrderStatsByMonth as getOrderStatsByMonthService,
  getProductStatsByMonth as getProductStatsByMonthService,
  getRevenueStatsByMonth as getRevenueStatsByMonthService,
  getMonthlySales as getMonthlySalesService,
  getRecentOrders as getRecentOrdersService,
} from "../../shared/services/dashboardService.js";

const getRecentOrders = async (req, res) => {
  try {
    const orders = await getRecentOrdersService();
    if (!orders.success) {
      return res.status(400).json(orders);
    }
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error in getRecentOrders controller:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getMonthlySales = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const sales = await getMonthlySalesService(year);
    if (!sales.success) {
      return res.status(400).json(sales);
    }
    res.status(200).json(sales);
  } catch (err) {
    console.error("Error in getMonthlySales controller:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getDashboardStats = (req, res) => getDashboardStatsService(req, res);

const getUserStatsByMonth = async (req, res) => {
  const { year, month } = req.query;
  const count = await getUserStatsByMonthService(Number(year), Number(month));
  res.json({ success: true, count });
};

const getOrderStatsByMonth = async (req, res) => {
  const { year, month } = req.query;
  const count = await getOrderStatsByMonthService(Number(year), Number(month));
  res.json({ success: true, count });
};

const getProductStatsByMonth = async (req, res) => {
  const { year, month } = req.query;
  const count = await getProductStatsByMonthService(
    Number(year),
    Number(month)
  );
  res.json({ success: true, count });
};

const getRevenueStatsByMonth = async (req, res) => {
  const { year, month } = req.query;
  const total = await getRevenueStatsByMonthService(
    Number(year),
    Number(month)
  );
  res.json({ success: true, total });
};

export {
  getDashboardStats,
  getUserStatsByMonth,
  getOrderStatsByMonth,
  getProductStatsByMonth,
  getRevenueStatsByMonth,
  getMonthlySales,
  getRecentOrders,
};
