import { getAllVariantsByProductId as getAllVariantsByProductIdService } from "../../shared/services/variantService.js";
const getVariantsByProductId = async (req, res) => {
  try {
    const { product_id } = req.params;
    const result = await getAllVariantsByProductIdService(product_id);
    if (result.success) {
      res.json({ variants: result.variants });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (err) {
    console.error("Error in getVariantsByProductId: ", err);
    res.status(500).json({ message: "Server error" });
  }
};

export { getVariantsByProductId };
