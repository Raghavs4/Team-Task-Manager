const { validationResult } = require('express-validator');

/**
 * validate — middleware that reads express-validator results
 * and short-circuits the request with a 400 if validation failed.
 * 
 * Usage: place after your validation chain in the route definition.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Return the first error message for simplicity, or all errors as an array
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
