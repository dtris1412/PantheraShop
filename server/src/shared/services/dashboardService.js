import db from "../models/index.js";
import { Op } from "sequelize";

//Lấy đơn hàng gần đây
const getRecentOrders = async (limit = 5) => {
  try {
    const orders = await db.Order.findAll({
      limit,
      include: [
        {
          model: db.Payment,
          attributes: ["payment_method", "payment_status"],
        },

        {
          model: db.User,
          attributes: ["user_id", "user_name", "user_email"],
        },
      ],
      order: [["order_date", "DESC"]],
    });

    const orderDetails = await Promise.all(
      orders.map(async (order) => {
        const orderProducts = await db.OrderProduct.findAll({
          where: { order_id: order.order_id },

          include: [
            {
              model: db.Variant,
              include: [
                {
                  model: db.Product,
                  attributes: [
                    "product_name",
                    "product_image",
                    "product_description",
                    "category_id",
                  ],
                  include: [
                    {
                      model: db.Category,
                      attributes: ["category_name"],
                    },
                  ],
                },
              ],
            },
          ],
        });
        return { ...order.toJSON(), orderProducts };
      })
    );

    if (!orders || orders.length === 0) {
      return { success: false, message: "No orders found" };
    }
    return { success: true, data: orderDetails };
  } catch (err) {
    console.error("Error in getAllOrders:", err);
    return { success: false, message: "Error fetching orders" };
  }
};

//Lấy doanh từng tháng
const getMonthlySales = async (year) => {
  try {
    const sales = [];
    for (let month = 1; month <= 12; month++) {
      const { start, end } = getMonthRange(year, month);
      const totalSales = await db.Order.sum("total_amount", {
        where: {
          order_date: { [Op.gte]: start, [Op.lt]: end },
          order_status: "Đã giao",
        },
      });
      sales.push({ month, value: totalSales || 0 });
    }
    return { success: true, sales };
  } catch (err) {
    console.error("Error in getMonthlySales:", err);
    return 0;
  }
};

// Hàm lấy khoảng thời gian của tháng
const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
};

// Lấy số lượng user theo tháng
const getUserStatsByMonth = async (year, month) => {
  try {
    const { start, end } = getMonthRange(year, month);
    return await db.User.count({
      where: { created_at: { [Op.gte]: start, [Op.lt]: end } },
    });
  } catch (err) {
    console.error("Error in getUserStatsByMonth:", err);
    return 0;
  }
};

// Lấy số lượng order theo tháng
const getOrderStatsByMonth = async (year, month) => {
  try {
    const { start, end } = getMonthRange(year, month);
    return await db.Order.count({
      where: { order_date: { [Op.gte]: start, [Op.lt]: end } },
    });
  } catch (err) {
    console.error("Error in getOrderStatsByMonth:", err);
    return 0;
  }
};

// Lấy số lượng product theo tháng
const getProductStatsByMonth = async (year, month) => {
  try {
    const { start, end } = getMonthRange(year, month);
    return await db.Product.count({
      where: { created_at: { [Op.gte]: start, [Op.lt]: end } },
    });
  } catch (err) {
    console.error("Error in getProductStatsByMonth:", err);
    return 0;
  }
};

// Lấy doanh thu theo tháng
const getRevenueStatsByMonth = async (year, month) => {
  try {
    const { start, end } = getMonthRange(year, month);
    return (
      (await db.Order.sum("total_amount", {
        where: {
          order_date: { [Op.gte]: start, [Op.lt]: end },
          order_status: "Đã giao",
        },
      })) || 0
    );
  } catch (err) {
    console.error("Error in getRevenueStatsByMonth:", err);
    return 0;
  }
};

// Hàm tính phần trăm thay đổi
const getTrend = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Hàm tổng hợp cho dashboard
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Lấy số liệu cho từng loại
    const [userCurrent, userPrev] = await Promise.all([
      getUserStatsByMonth(currentYear, currentMonth),
      getUserStatsByMonth(previousYear, previousMonth),
    ]);
    const [orderCurrent, orderPrev] = await Promise.all([
      getOrderStatsByMonth(currentYear, currentMonth),
      getOrderStatsByMonth(previousYear, previousMonth),
    ]);
    const [productCurrent, productPrev] = await Promise.all([
      getProductStatsByMonth(currentYear, currentMonth),
      getProductStatsByMonth(previousYear, previousMonth),
    ]);
    const [revenueCurrent, revenuePrev] = await Promise.all([
      getRevenueStatsByMonth(currentYear, currentMonth),
      getRevenueStatsByMonth(previousYear, previousMonth),
    ]);

    // Trả về dữ liệu cho frontend
    res.json({
      success: true,
      data: {
        users: {
          value: userCurrent,
          trend: {
            value: Math.abs(getTrend(userCurrent, userPrev)).toFixed(2) + "%",
            isPositive: getTrend(userCurrent, userPrev) >= 0,
          },
        },
        orders: {
          value: orderCurrent,
          trend: {
            value: Math.abs(getTrend(orderCurrent, orderPrev)).toFixed(2) + "%",
            isPositive: getTrend(orderCurrent, orderPrev) >= 0,
          },
        },
        products: {
          value: productCurrent,
          trend: {
            value:
              Math.abs(getTrend(productCurrent, productPrev)).toFixed(2) + "%",
            isPositive: getTrend(productCurrent, productPrev) >= 0,
          },
        },
        revenue: {
          value: revenueCurrent,
          trend: {
            value:
              Math.abs(getTrend(revenueCurrent, revenuePrev)).toFixed(2) + "%",
            isPositive: getTrend(revenueCurrent, revenuePrev) >= 0,
          },
        },
      },
    });
  } catch (err) {
    console.error("Error in getDashboardStats: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
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
