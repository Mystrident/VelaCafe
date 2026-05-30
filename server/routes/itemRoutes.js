const express = require("express");
const router = express.Router();
const {
  getItems,
  addItem,
  deleteItem,
  updateStock, // Import the new function
  toggleAvailability,
} = require("../controllers/itemController");

const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");
const { validateItem } = require("../middleware/validators");

router.get("/", getItems);
router.post("/", protect, upload.single("image"), validateItem, addItem);
router.delete("/:id", protect, deleteItem);
router.patch("/:id/stock", protect, updateStock); // New Route for updating stock
router.patch("/:id", protect, toggleAvailability);

module.exports = router;