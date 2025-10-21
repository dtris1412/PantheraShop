import db from "../models/index.js";

const getAllVouchers = async () => {
  const vouchers = await db.Voucher.findAll();
  //   console.log(vouchers);
  if (!vouchers) {
    throw new Error("No vouchers found");
  }
  return vouchers;
};

export { getAllVouchers };
