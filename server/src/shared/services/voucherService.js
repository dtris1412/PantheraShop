import db from "../../shared/models/index.js";

const getAllVouchers = async () => {
  const vouchers = await db.Voucher.findAll();
  //   console.log(vouchers);
  if (!vouchers) {
    throw new Error("No vouchers found");
  }
  return vouchers;
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
export { getAllVouchers, decreaseVoucherStock };
