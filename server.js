require("dotenv").config({ quiet: true });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const chalk = require("chalk");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");
const wishlistRoutes = require("./routes/wishlist");

const app = express();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(helmet());

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200,
// });
// app.use(limiter);

const allowedOrigins = [
  "https://maros-client.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ====== API ROUTES ======
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Hello World from backend" });
});

// ====== Connect to DB and Start Server ======
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(chalk.green(`🚀 DB CONNECTED`));
    app.listen(PORT, () => {
      console.log(chalk.green(`🚀 SERVER IS RUNNING...`));
    });
  })
  .catch((err) => {
    console.error(chalk.red("❌ MongoDB connection failed:", err.message));
    process.exit(1);
  });
