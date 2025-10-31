import express from "express";
import dotenv from "dotenv";
// import viewEngine from "./config/viewEngine.js";
import initWebRoutes from "./user/routes/web.js";
import initAdminRoutes from "./admin/routes/webAdmin.js";

import connectDB from "./shared/config/connectDB.js";

import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// // Config view engine
// viewEngine(app);

// Cho phép CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Init web routes
initWebRoutes(app); // User routes - prefix: /api
initAdminRoutes(app); // Admin routes - prefix: /api/admin

// Connect to DB
connectDB();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
