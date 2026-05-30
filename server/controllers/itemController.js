const Item = require("../models/Item");

const getItems = async (req, res) => {
  try {
    const items = await Item.find();

    res.json(items);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

const addItem = async (req, res) => {
  try {
    const { name, price } = req.body;

    const item = new Item({
      name,
      price,
      image: req.file ? req.file.path : "",
    });

    await item.save();

    res.status(201).json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: "Item removed" });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    item.available = !item.available;

    await item.save();

    res.json(item);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

module.exports = {
  getItems,
  addItem,
  deleteItem,
  toggleAvailability,
};
