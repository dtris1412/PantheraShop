import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import initWebRoutes from "./user/routes/web.js";
import initAdminRoutes from "./admin/routes/webAdmin.js";
import connectDB from "./shared/config/connectDB.js";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production" ? true : "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ============================================
// API ROUTES - Phải đặt TRƯỚC static files
// ============================================
initWebRoutes(app); // /api/*
initAdminRoutes(app); // /api/admin/*

// ============================================
// SERVE REACT STATIC FILES (như Nginx)
// ============================================
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../client/dist");

  // Serve static files
  app.use(express.static(frontendPath));

  // SPA fallback - trả về index.html cho mọi route không phải API
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

connectDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
