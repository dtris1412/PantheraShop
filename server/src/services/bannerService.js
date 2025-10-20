import db from "../models/index.js";

const getAllBanners = async () => {
  const banners = await db.Banner.findAll();
  if (!banners) return { success: false, message: "No banners found" };
  return { success: true, data: banners };
};

export { getAllBanners };
