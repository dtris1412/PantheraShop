import db from "../models/index.js";

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
  createSupplier,
  updateSupplier,
  //   cancelTerminalConnection,
  setSupplierConnectionStatus,
};
