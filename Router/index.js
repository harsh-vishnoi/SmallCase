const express = require("express");
const portfolio = require("./portfolio.js");
const trade = require("./trade.js");
const router = express.Router();

router.get('/', (req, res) => {
  res.send('This is entry point to APIs');
})

router.use('/portfolio', portfolio);
router.use('/trade', trade);

module.exports = router;
