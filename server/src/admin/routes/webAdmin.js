import express from "express";
import { verifyAdmin } from "../../shared/middlewares/adminMiddleware.js";

// Import admin controllers here

import { getAllUsers } from "../../admin/controllers/userController.js";
const router = express.Router();

const initAdminRoutes = (app) => {
  //User Management
  router.get("/api/admin/users", verifyAdmin, getAllUsers);
  return app.use("/", router);
};

export default initAdminRoutes;
