import {
  getAllVouchers as getAllVouchersService,
  decreaseVoucherStock as decreaseVoucherStockService,
} from "../services/voucherService.js";

const getAllVouchers = async (req, res) => {
  try {
    const vouchers = await getAllVouchersService();

    res.status(200).json(vouchers);
  } catch (err) {
    console.error("Error fetching vouchers: ", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const decreaseVoucherStock = async (req, res) => {
  try {
    const { voucher_id } = req.body;
    const result = await decreaseVoucherStockService(voucher_id);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    res.status(200).json({
      message: result.message,
      usage_limit: result.usage_limit,
      usage_status: result.usage_status,
    });
  } catch (err) {
    console.error("Error decreasing voucher stock: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export { getAllVouchers, decreaseVoucherStock };
