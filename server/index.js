import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import UserRouter from "./routes/User.js";
import ProductRoutes from "./routes/Products.js";
import { initializeSampleProducts } from "./controllers/Products.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

//error handel
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

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Hello GFG Developers",
  });
});

app.use("/api/user/", UserRouter);
app.use("/api/products/", ProductRoutes);

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MongoDBURI);
    console.log("Connected to MongoDB successfully");

    // Initialize sample products after successful connection
    await initializeSampleProducts();
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    app.listen(8080, () => console.log("Server started on port 8080"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
