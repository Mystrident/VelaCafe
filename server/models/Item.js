const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
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