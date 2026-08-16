require("dotenv").config();

require("./jobs/deleteOldOrders");
const {
  attachIo: attachIoToReservationJob,
} = require("./jobs/releaseExpiredReservations");

const express = require("express");
const http = require("http");

const helmet = require("helmet");
const cors = require("cors");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("mongo-sanitize");

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const Order = require("./models/Order");

const itemRoutes = require("./routes/itemRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userAuthRoutes = require("./routes/userAuthRoutes");
const { razorpayWebhook } = require("./controllers/paymentController");

const app = express();

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://vela-cafe.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);
attachIoToReservationJob(io);

// Stock updates are public, but admin and customer order rooms are private.
// Authenticate a socket once during its handshake before it can join either.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "admin") socket.data.adminId = decoded.id;
    if (decoded.role === "customer") socket.data.customerId = decoded.id;
  } catch {
    // A bad token simply has no admin privileges; normal public socket
    // events (such as stock updates) can still connect.
  }
  next();
});

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  socket.on("join-order", async (orderId) => {
    // Only allow joining rooms that look like real order ids
    if (typeof orderId !== "string" || !/^[a-f\d]{24}$/i.test(orderId)) {
      return;
    }

    // Status updates may contain order details, so a customer must prove
    // ownership before joining this room. Public stock sockets remain open.
    if (!socket.data.customerId) return;

    try {
      const order = await Order.exists({
        _id: orderId,
        userId: socket.data.customerId,
      });
      if (!order) return;

      socket.join(orderId);
      console.log(`Socket ${socket.id} joined order ${orderId}`);
    } catch (error) {
      console.error(`Failed to authorize order room ${orderId}:`, error);
    }
  });

  socket.on("join-admin", () => {
    if (socket.data.adminId) socket.join("admins");
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnected:", socket.id);
  });
});

connectDB();

// Required when deployed behind a reverse proxy (Render, Railway, etc.)
// so rate limiting sees the real client IP instead of the proxy's.
app.set("trust proxy", 1);

app.disable("x-powered-by");

app.use(helmet());

app.use(cors(corsOptions));

// Registered BEFORE express.json() and with its own raw-body parser: the
// webhook's HMAC signature is computed over the exact raw bytes Razorpay
// sent, which express.json() would otherwise consume and re-serialize
// differently. This route calls res.json()/res.status() directly and never
// calls next(), so it's fully handled here without reaching express.json()
// below.
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json", limit: "50kb" }),
  razorpayWebhook,
);

app.use(express.json({ limit: "50kb" }));

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

// Stricter limit on login endpoints to slow down brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again later.",
});

app.use("/api/admin/login", authLimiter);
app.use("/api/auth/google", authLimiter);

// Sastranet requests are already signed and one-time-use. A separate limit
// avoids blocking a group of students who share one campus/mobile-network IP.
const sastranetAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many Sastranet sign-in attempts. Please try again later.",
});
app.use("/api/auth/sastranet", sastranetAuthLimiter);

app.get("/", (req, res) => {
  res.send("VELAA CAFE API RUNNING");
});

app.get("/api/ping", (req, res) => {
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
