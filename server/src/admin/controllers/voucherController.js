import {
  createVoucher as createVoucherService,
  updateVoucher as updateVoucherService,
  getAllVouchers as getAllVouchersService,
  getVouchersPaginated as getVouchersPaginatedService,
} from "../../shared/services/voucherService.js";

const getAllVouchers = async (req, res) => {
  try {
    const result = await getAllVouchersService();
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAllVouchers controller:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      err,
    });
  }
};

const getVouchersPaginated = async (req, res) => {
  try {
    const { search, discount_type, voucher_status, limit, page } = req.query;
    const result = await getVouchersPaginatedService({
      search,
      discount_type,
      voucher_status,
      limit,
      page,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getVouchersPaginated:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const createVoucher = async (req, res) => {
  try {
    const {
      voucher_code,
      discount_type,
      discount_value,
      min_order_value,
      start_date,
      end_date,
      usage_limit,
      voucher_status,
    } = req.body;

    const result = await createVoucherService(
      voucher_code,
      discount_type,
      discount_value,
      min_order_value,
      start_date,
      end_date,
      usage_limit,
      voucher_status
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in createVoucher controller:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      err,
    });
  }
};

const updateVoucher = async (req, res) => {
  try {
    const { voucher_id } = req.params;
    const {
      voucher_code,
      discount_type,
      discount_value,
      min_order_value,
      start_date,
      end_date,
      usage_limit,
      voucher_status,
    } = req.body;
    const result = await updateVoucherService(
      voucher_id,
      voucher_code,
      discount_type,
      discount_value,
      min_order_value,
      start_date,
      end_date,
      usage_limit,
      voucher_status
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in updateVoucher controller:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      err,
    });
  }
};

export { createVoucher, updateVoucher, getAllVouchers, getVouchersPaginated };
