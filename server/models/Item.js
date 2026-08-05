const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  normalizedName: {
    type: String,
    unique: true,
    sparse: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: { type: String, default: "Uncategorized"},
  image: {
    type: String,
  },
  available: {
    type: Boolean,
    default: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("Item", itemSchema);
