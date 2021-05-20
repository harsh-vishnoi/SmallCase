const router = require("express").Router();
const { validate, ValidationError, Joi } = require('express-validation')
const controller = require("../controller/trade.js");
const validation = require("../controller/validations.js");

router.get('/', (req, res) => {
  res.send("Trade is Working");
})

// Test Body
// {
//     "tickerSymbol" : "REL",
//     "action" : "BUY",
//     "quantity" : 1000,
//     "price": "100"
// }
router.post(
  '/add',
  validate(validation.add),
  controller.add
);

router.delete(
  '/:id',
  validate(validation.remove),
  controller.remove
);


router.put(
  '/:id',
  validate(validation.update),
  controller.update
);

module.exports = router;
