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
const migrateAndCleanItems = async (req, res) => {
  try {
    const items = await Item.find();

    // --- PART 1: REMOVE DUPLICATES ---
    const seenNames = new Set();
    let deletedCount = 0;

    for (const item of items) {
      const normalizedName = item.name.toLowerCase().trim();
      if (seenNames.has(normalizedName)) {
        await Item.findByIdAndDelete(item._id);
        deletedCount++;
      } else {
        seenNames.add(normalizedName);
      }
    }

    // --- PART 2: GRANULAR CATEGORIZATION ---
    const cleanedItems = await Item.find();
    let updatedCount = 0;

    for (let item of cleanedItems) {
      const lower = item.name.toLowerCase();
      let newCategory = "Uncategorized";

      if (lower.match(/milk|tea|coffee|lassi|drink/)) {
        newCategory = "Beverages";
      } else if (lower.includes("puff")) {
        newCategory = "Puffs";
      } else if (lower.includes("roll")) {
        newCategory = "Rolls";
      } else if (lower.match(/vadai|vada/)) {
        newCategory = "Vadai";
      } else if (lower.match(/bajji|baji/)) {
        newCategory = "Bajjis";
      } else if (lower.match(/paneer|panner/)) {
        // Catches the 'panner' typo from the DB
        newCategory = "Paneer";
      } else if (lower.match(/pizza|burger|parotta/)) {
        newCategory = "Pizza & Burgers";
      } else if (lower.match(/chips|cutlet|samosa/)) {
        newCategory = "Chips & Cutlets";
      } else if (
        lower.match(
          /cake|brownie|tiramisu|mousse|tresleches|bombolini|bread|rusk|bun|sweet|doughnut|choco lava|ladoo/,
        )
      ) {
        newCategory = "Bakery & Desserts";
      } else if (lower.match(/sprouts|legumes|salad/)) {
        newCategory = "Healthy & Groceries";
      } else if (lower.match(/muruku|suliyam|athirasam|kolukataii/)) {
        newCategory = "Traditional Snacks";
      }

      if (item.category !== newCategory) {
        item.category = newCategory;
        await item.save();
        updatedCount++;
      }
    }

    res.json({
      message: "Database optimization complete!",
      duplicatesRemoved: deletedCount,
      itemsCategorized: updatedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Migration failed" });
  }
};

const addItem = async (req, res) => {
  try {
    const { name, price, stock, category } = req.body;

    const safeStock = Math.max(0, Math.floor(Number(stock) || 0));

    const item = new Item({
      name,
      price,
      category: category || "Uncategorized",
      stock: Math.min(safeStock, 10000),
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

const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const safeStock = Math.max(0, Math.floor(Number(stock) || 0));
    item.stock = Math.min(safeStock, 10000);
    await item.save();

    // 🔴 NEW: Broadcast the stock change to all connected customers instantly!
    const io = req.app.get("io");
    if (io) {
      io.emit("stock-updated", {
        itemId: item._id,
        newStock: item.stock,
      });
    }

    res.json(item);
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
      return res.status(404).json({ message: "Item not found" });
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
  updateStock,
  toggleAvailability,
  migrateAndCleanItems,
};
