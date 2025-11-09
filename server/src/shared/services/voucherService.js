import db from "../../shared/models/index.js";

const createVoucher = async (
  voucher_code,
  discount_type,
  discount_value,
  min_order_value,
  start_date,
  end_date,
  usage_limit,
  voucher_status
) => {
  try {
    if (
      !voucher_code ||
      !discount_type ||
      !discount_value ||
      !start_date ||
      !end_date ||
      !usage_limit ||
      !min_order_value
    ) {
      return { success: false, message: "Missing required fields" };
    }
    const newVoucher = await db.Voucher.create({
      voucher_code,
      discount_type,
      discount_value,
      min_order_value,
      start_date,
      end_date,
      usage_limit,
      used_count: 0,
      voucher_status,
    });
    return { success: true, voucher: newVoucher };
  } catch (err) {
    console.error("Error in createVoucher:", err);
    return { success: false, message: "Internal server error" };
  }
};

const updateVoucher = async (
  voucher_id,
  voucher_code,
  discount_type,
  discount_value,
  min_order_value,
  start_date,
  end_date,
  usage_limit,
  voucher_status
) => {
  try {
    if (!voucher_id) {
      return { success: false, message: "Voucher ID is required" };
    }

    const voucher = await db.Voucher.findOne({ where: { voucher_id } });
    if (!voucher) {
      return { success: false, message: "Voucher not found" };
    }

    // Cập nhật các trường nếu có giá trị mới
    voucher.voucher_code = voucher_code || voucher.voucher_code;
    voucher.discount_type = discount_type || voucher.discount_type;
    voucher.discount_value = discount_value || voucher.discount_value;
    voucher.min_order_value = min_order_value || voucher.min_order_value;
    voucher.start_date = start_date || voucher.start_date;
    voucher.end_date = end_date || voucher.end_date;
    voucher.usage_limit = usage_limit || voucher.usage_limit;
    voucher.voucher_status = voucher_status || voucher.voucher_status;

    await voucher.save();

    return { success: true, voucher };
  } catch (err) {
    console.error("Error in updateVoucher:", err);
    return { success: false, message: "Internal server error" };
  }
};
const getAllVouchers = async () => {
  const vouchers = await db.Voucher.findAll();
  //   console.log(vouchers);
  if (!vouchers) {
    throw new Error("No vouchers found");
  }
  return { success: true, data: vouchers };
};

const decreaseVoucherStock = async (voucher_id) => {
  if (!voucher_id) {
    return { success: false, message: "Missing voucher_id" };
  }
  const voucher = await db.Voucher.findOne({ where: { voucher_id } });
  if (!voucher) {
    return { success: false, message: "Voucher not found" };
  }
  if (voucher.usage_limit <= 0) {
    voucher.voucher_status = "inactive";
    await voucher.save();
    return { success: false, message: "Voucher is out of stock" };
  }
  voucher.usage_limit -= 1;
  voucher.used_count += 1;
  if (voucher.usage_limit <= 0) {
    voucher.voucher_status = "inactive";
  }
  await voucher.save();
  return {
    success: true,
    message: "Voucher stock decreased",
    usage_limit: voucher.usage_limit,
    usage_status: voucher.voucher_status,
  };
};
export { getAllVouchers, decreaseVoucherStock, createVoucher, updateVoucher };
