import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

import UserRouter from "./routes/User.js";
import ProductRoutes from "./routes/Products.js";
import { initializeSampleProducts } from "./controllers/Products.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  console.error("Error details:", {
    status,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user,
  });
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello GFG Developers",
  });
});

// API routes
app.use("/api/user", UserRouter);
app.use("/api/products", ProductRoutes);

// MongoDB URI from .env
const URI = process.env.MongoDBURI;

// Connect to MongoDB and start server
mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // Optional: insert sample data if needed
    await initializeSampleProducts();

    app.listen(8080, () => {
      console.log("🚀 Server started on http://localhost:8080");
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  });
