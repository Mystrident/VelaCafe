const express = require("express");

const router = express.Router();

const {
  getItems,
  addItem,
  deleteItem,
  toggleAvailability,
} = require("../controllers/itemController");

const upload = require("../middleware/upload");

const protect = require("../middleware/authMiddleware");

router.get("/", getItems);

router.post("/", protect, upload.single("image"), addItem);

router.delete("/:id", protect, deleteItem);

router.patch("/:id", protect, toggleAvailability);

module.exports = router;
