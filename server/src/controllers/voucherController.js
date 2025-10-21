import { getAllVouchers as getAllVouchersService } from "../services/voucherService.js";

const getAllVouchers = async (req, res) => {
  try {
    const vouchers = await getAllVouchersService();

    res.status(200).json(vouchers);
  } catch (err) {
    console.error("Error fetching vouchers: ", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export { getAllVouchers };
