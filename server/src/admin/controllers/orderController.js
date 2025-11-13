import {
  getAllOrders as getAllOrdersService,
  getStatusOrder as getStatusOrderService,
  getOrderHistoryByUserId as getOrderHistoryByUserIdService,
  getOrdersPaginated as getOrdersPaginatedService,
  approveOrder as approveOrderService,
} from "../../shared/services/orderService.js";

const getAllOrders = async (req, res) => {
  try {
    const result = await getAllOrdersService();

    if (!result) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAllOrders: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getStatusOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const result = await getStatusOrderService(order_id);
    if (!result) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getStatusOrder: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getOrderHistoryByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await getOrderHistoryByUserIdService(user_id);
    if (!result) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getOrderHistoryByUserId: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const approveOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const result = await approveOrderService(order_id, status);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in approveOrder: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getOrdersPaginated = async (req, res) => {
  try {
    const { search, order_status, limit = 10, page = 1 } = req.query;
    const result = await getOrdersPaginatedService(
      search,
      order_status,
      parseInt(limit),
      parseInt(page)
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getOrdersPaginated controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
  getAllOrders,
  getStatusOrder,
  getOrderHistoryByUserId,
  getOrdersPaginated,
  approveOrder,
};
