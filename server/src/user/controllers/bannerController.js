import { getAllBanners as getAllBannersService } from "../../shared/services/bannerService.js";

const getAllBanners = async (req, res) => {
  try {
    const banners = await getAllBannersService();
    if (!banners.success) {
      return res.status(404).json({ message: banners.message });
    }
    res.status(200).json(banners.data);
  } catch (err) {
    console.error("Error fetching banners:  ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export { getAllBanners };
