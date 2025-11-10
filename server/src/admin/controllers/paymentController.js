import { getMethodByOrderId as getMethodByOrderIdService } from "../../shared/services/paymentService.js";

const getMethodByOrderId = async (req, res) => {
  try {
    const { order_id } = req.params;
    const result = await getMethodByOrderIdService(order_id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getMethodByOrderId: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
export { getMethodByOrderId };
