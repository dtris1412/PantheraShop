import {
  getAllInventory as getAllVariantsService,
  getInventoryPaginated as getInventoryPaginatedService,
  createVariant as createVariantService,
  getVariantsById as getVariantsByIdService,
  updateVariant as updateVariantService,
} from "../../shared/services/inventoryService.js";

const getAllInventories = async (req, res) => {
  try {
    const result = await getAllVariantsService();
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAllInventories controller: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getInventoryPaginated = async (req, res) => {
  try {
    const { search, limit = 10, page = 1 } = req.query;
    const result = await getInventoryPaginatedService(
      search,
      parseInt(limit),
      parseInt(page)
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getInventoryPaginated controller: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
const createVariantInventory = async (req, res) => {
  try {
    const { variant_size, variant_color, variant_stock, product_id } = req.body;
    const result = await createVariantService(
      variant_size,
      variant_color,
      variant_stock,
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

const getVariantsByIdInventory = async (req, res) => {
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

const updateVariantInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const { variant_size, variant_color, variant_stock } = req.body;
    const result = await updateVariantService(
      id,
      variant_size,
      variant_color,
      variant_stock
    );
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

export {
  getAllInventories,
  getInventoryPaginated,
  getVariantsByIdInventory,
  createVariantInventory,
  updateVariantInventory,
};
