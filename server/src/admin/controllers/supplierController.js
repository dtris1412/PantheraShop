import {
  getAllSuppliers as getAllSuppliersService,
  createSupplier as createSupplierService,
  updateSupplier as updateSupplierService,
  //   cancelTerminalConnection as cancelTerminalConnectionService,
  setSupplierConnectionStatus as setSupplierConnectionStatusService,
} from "../../shared/services/supplierService.js";

const getAllSuppliers = async (req, res) => {
  try {
    const result = await getAllSuppliersService();

    if (!result) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAllSuppliers: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const createSupplier = async (req, res) => {
  try {
    const {
      supplier_name,
      supplier_email,
      supplier_phone,
      supplier_address,
      supplier_type,
    } = req.body;
    const newSupplier = await createSupplierService(
      supplier_name,
      supplier_email,
      supplier_phone,
      supplier_address,
      supplier_type
    );
    if (!newSupplier) {
      return res.status(400).json(newSupplier);
    }
    res.status(201).json(newSupplier);
  } catch (err) {
    console.error("Error in createSupplier: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const {
      supplier_name,
      supplier_email,
      supplier_phone,
      supplier_address,
      supplier_type,
    } = req.body;
    const { supplier_id } = req.params;
    const updatedSupplier = await updateSupplierService(
      supplier_id,
      supplier_name,
      supplier_email,
      supplier_phone,
      supplier_address,
      supplier_type
    );

    if (!updatedSupplier) {
      return res.status(400).json(updatedSupplier);
    }
    res.status(200).json(updatedSupplier);
  } catch (err) {
    console.error("Error in updateSupplier: ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// const cancelTerminalConnection = async (req, res) => {
//   try {
//     const { supplier_id } = req.params;
//     const result = await cancelTerminalConnectionService(supplier_id);
//     if (!result) {
//       return res.status(400).json(result);
//     }
//     res.status(200).json(result);
//   } catch (err) {
//     console.error("Error in cancelTerminalConnection: ", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: err.message,
//     });
//   }
// };

const setSupplierConnectionStatus = async (req, res) => {
  try {
    const { supplier_id } = req.params;
    const { is_connected } = req.body;
    const result = await setSupplierConnectionStatusService(
      supplier_id,
      is_connected
    );
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in updateSupplierConnectionStatus:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
export {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  //   cancelTerminalConnection,
  setSupplierConnectionStatus,
};
