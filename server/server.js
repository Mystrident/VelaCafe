require("dotenv").config();

const express = require("express");

const helmet = require("helmet");

const cors = require("cors");

const hpp = require("hpp");

const rateLimit = require("express-rate-limit");

const mongoSanitize = require("mongo-sanitize");

const connectDB = require("./config/db");

const itemRoutes = require("./routes/itemRoutes");

const orderRoutes = require("./routes/orderRoutes");

const authRoutes = require("./routes/authRoutes");

const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

connectDB();

app.use(helmet());

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

app.use((req, res, next) => {
  req.body = mongoSanitize(req.body);
  next();
});

app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please try again later.",
});

app.use(limiter);

app.get("/", (req, res) => {
  res.send("VELAA CAFE API RUNNING");
});

app.use("/api/items", itemRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/admin", authRoutes);

app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
