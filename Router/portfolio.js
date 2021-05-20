const router = require("express").Router();
const portfolioController = require("../controller/portfolio.js");

router.get('/', (req, res) => {
  res.send("Portfolio is Working");
})

// router.get('/trades', (req, res) => {
  // res.send("trades is Working");
// })
router.get('/trades', portfolioController.getPortfolio);

// router.get('/holdings', (req, res) => {
//   res.send("holdings is Working");
// })
router.get('/holdings', portfolioController.getHoldings);

// router.get('/returns', (req, res) => {
//   res.send("returns is Working");
// })
router.get('/returns', portfolioController.getReturns);

module.exports = router;
