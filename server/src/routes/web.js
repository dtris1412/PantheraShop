import express from "express";
import { getAllUsers, getUserById } from "../controllers/userController.js";
import { register } from "../controllers/authController.js";

const router = express.Router();

const initWebRoutes = (app) => {
  //api user
  router.get("/api/users", getAllUsers);
  //api getUserById
  router.get("/api/user/:user_id", getUserById);
  //api register
  router.post("/api/register", register);

  //api

  return app.use("/", router);
};

export default initWebRoutes;
