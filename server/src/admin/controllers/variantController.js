import {
  createVariant as createVariantService,
  getVariantsById as getVariantsByIdService,
  updateVariant as updateVariantService,
  deleteVariant as deleteVariantService,
} from "../../shared/services/variantService.js";

const createVariant = async (req, res) => {
  try {
    // ✅ Chỉ lấy size và color, không lấy stock
    const { variant_size, variant_color, product_id } = req.body;
    const result = await createVariantService(
      variant_size,
      variant_color,
      product_id
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in createVariant controller: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getVariantsById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getVariantsByIdService(id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getVariantsById controller: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const { variant_size, variant_color } = req.body;
    const result = await updateVariantService(id, variant_size, variant_color);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in updateVariant controller: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteVariantService(id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in deleteVariant controller: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export { getVariantsById, createVariant, updateVariant, deleteVariant };
