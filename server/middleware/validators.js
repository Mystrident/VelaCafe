const { body, validationResult } = require("express-validator");

const validateOrder = [
  body("customerName")
    .trim()
    .isLength({
      min: 2,
      max: 50,
    })
    .withMessage("Name must be 2-50 characters"),

  body("department")
    .trim()
    .isLength({
      min: 2,
      max: 30,
    })
    .withMessage("Department must be 2-30 characters"),

  body("pickupTime")
    .trim()
    .isLength({
      min: 1,
      max: 20,
    })
    .withMessage("Invalid pickup time"),

  body("items")
    .isArray({
      min: 1,
    })
    .withMessage("At least one item required"),

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

module.exports = {
  validateOrder,
  validateItem,
};
