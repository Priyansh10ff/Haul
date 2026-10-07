import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import customerRoutes from "./routes/customer.routes.js";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import dns from "dns";
dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// CLIENT_URL can hold several origins separated by commas.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/customers/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Hello, welcome to haul",
  });
});

// Used by the host (Render) and uptime monitors.
app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "error",
    db: dbConnected ? "connected" : "disconnected",
  });
});

const PORT = process.env.PORT || 8001;

// Only accept traffic once the database is reachable.
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Connected");

    app.listen(PORT, () => {
      console.log(`Server Started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
