const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const validateOrder = [
  body("pickupTime")
    .trim()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Invalid time format. Must be HH:MM")
    .custom((value) => {
      // String comparison works perfectly here because the format is strictly HH:MM
      if (value < "08:45" || value > "18:00") {
        throw new Error("Pickup time must be between 08:45 AM and 06:00 PM");
      }
      return true;
    }),
  body("items")
    .isArray({
      min: 1,
      max: 30,
    })
    .withMessage("At least one item required"),
  body("items.*.itemId")
    .isMongoId()
    .withMessage("Invalid item id"),
  body("items.*.quantity")
    .isInt({
      min: 1,
      max: 50,
    })
    .withMessage("Invalid quantity"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    next();
  },
];

const validateItem = [
  body("name")
    .trim()
    .isLength({
      min: 2,
      max: 50,
    })
    .withMessage("Item name must be 2-50 characters"),
  body("price")
    .isFloat({
      min: 1,
      max: 5000,
    })
    .withMessage("Price must be between 1 and 5000"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    next();
  },
];

const validateObjectId = [
  param("id")
    .custom((value) => mongoose.isValidObjectId(value))
    .withMessage("Invalid ID format"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = {
  validateOrder,
  validateItem,
  validateObjectId,
};