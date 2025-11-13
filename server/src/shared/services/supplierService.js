import db from "../models/index.js";
import { Op } from "sequelize";

const getAllSuppliers = async () => {
  try {
    const suppliers = await db.Supplier.findAll();
    if (!suppliers) return { success: false, message: "No suppliers found" };
    return { success: true, suppliers };
  } catch (err) {
    console.error("Error in getAllSuppliers:", err);
    return { success: false, message: "Internal server error" };
  }
};

const getSuppliersPaginated = async ({
  search = "",
  supplier_type = "",
  is_connected = "",
  limit = 10,
  page = 1,
}) => {
  try {
    const offset = (page - 1) * limit;

    // Build where conditions
    const where = {};

    // Search across multiple fields
    if (search) {
      where[Op.or] = [
        { supplier_name: { [Op.substring]: search } },
        { supplier_email: { [Op.substring]: search } },
        { supplier_phone: { [Op.substring]: search } },
        { supplier_address: { [Op.substring]: search } },
      ];
    }

    // Filter by supplier type
    if (supplier_type) {
      where.supplier_type = supplier_type;
    }

    // Filter by connection status
    if (is_connected !== "") {
      where.is_connected = is_connected === "true";
    }

    // Get total count
    const totalCount = await db.Supplier.count({ where });

    // Get paginated suppliers
    const suppliers = await db.Supplier.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    return {
      success: true,
      suppliers,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (err) {
    console.error("Error in getSuppliersPaginated:", err);
    return { success: false, message: "Internal server error" };
  }
};

const createSupplier = async (
  supplier_name,
  supplier_email,
  supplier_phone,
  supplier_address,
  supplier_type
) => {
  try {
    const newSupplier = await db.Supplier.create({
      supplier_name,
      supplier_email,
      supplier_phone,
      supplier_address,
      supplier_type,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return { success: true, supplier: newSupplier };
  } catch (err) {
    console.error("Error in createSupplier:", err);
    return { success: false, message: "Internal server error" };
  }
};

const updateSupplier = async (
  supplier_id,
  supplier_name,
  supplier_email,
  supplier_phone,
  supplier_address,
  supplier_type
) => {
  try {
    const supplier = await db.Supplier.findOne({ where: { supplier_id } });
    if (!supplier) {
      return { success: false, message: "Supplier not found" };
    }
    supplier.supplier_name = supplier_name;
    supplier.supplier_email = supplier_email;
    supplier.supplier_phone = supplier_phone;
    supplier.supplier_address = supplier_address;
    supplier.supplier_type = supplier_type;
    supplier.updated_at = new Date();
    await supplier.save();
    return { success: true, supplier };
  } catch (err) {
    console.error("Error in updateSupplier:", err);
    return { success: false, message: "Internal server error" };
  }
};

// const cancelTerminalConnection = async (supplier_id) => {
//   try {
//     const supplier = await db.Supplier.findOne({ where: { supplier_id } });
//     if (!supplier) {
//       return { success: false, message: "Supplier not found" };
//     }
//     supplier.is_connected = false;
//     await supplier.save();
//     return { success: true, supplier };
//   } catch (err) {
//     console.error("Error in cancel TerminalConnection: ", err);
//     return { success: false, message: "Internal server error" };
//   }
// };

const setSupplierConnectionStatus = async (supplier_id, is_connected) => {
  try {
    const supplier = await db.Supplier.findOne({ where: { supplier_id } });
    if (!supplier) {
      return { success: false, message: "Supplier not found" };
    }
    supplier.is_connected = is_connected;
    await supplier.save();
    return { success: true, supplier };
  } catch (err) {
    console.error("Error in setSupplierConnectionStatus:", err);
    return { success: false, message: "Internal server error" };
  }
};

export {
  getAllSuppliers,
  getSuppliersPaginated,
  createSupplier,
  updateSupplier,
  //   cancelTerminalConnection,
  setSupplierConnectionStatus,
};
