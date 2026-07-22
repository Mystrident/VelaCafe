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
const { validateItem, validateObjectId } = require("../middleware/validators");

router.get("/", getItems);
router.post("/", protect, upload.single("image"), validateItem, addItem);
router.delete("/:id", protect, validateObjectId, deleteItem);
router.patch("/:id/stock", protect, validateObjectId, updateStock); // New Route for updating stock
router.patch("/:id", protect, validateObjectId, toggleAvailability);

module.exports = router;