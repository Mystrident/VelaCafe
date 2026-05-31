require("dotenv").config();

require("./jobs/deleteOldOrders");

const express = require("express");
const http = require("http");

const helmet = require("helmet");
const cors = require("cors");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("mongo-sanitize");

const { Server } = require("socket.io");

const connectDB = require("./config/db");

const itemRoutes = require("./routes/itemRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userAuthRoutes = require("./routes/userAuthRoutes");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  socket.on("join-order", (orderId) => {
    socket.join(orderId);

    console.log(`Socket ${socket.id} joined order ${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnected:", socket.id);
  });
});

connectDB();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
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

app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: "Server is awake and ready!" });
});

app.use("/api/items", itemRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/admin", authRoutes);

app.use("/api/auth", userAuthRoutes);

app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
