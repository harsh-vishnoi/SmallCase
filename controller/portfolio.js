const Trade = require("../Model/trade.js");
const Stock = require("../Model/stock.js");

const getPortfolio = async (req, res) => {
  let securities = await Stock.find({ quantity: { $ne: 0 } }).select('tickerSymbol -_id');
    securities = securities.map((doc) => doc.tickerSymbol);
    const portfolio = await Promise.all(securities.map(async (tickerSymbol) => {
      const trades = await Trade.find({ tickerSymbol }).select('-tickerSymbol -__v');
      return {
        [tickerSymbol]: {
          trades,
        },
      };
    }));
  return res.status(200).json(portfolio);
}

var getHoldings = async (req, res) => {
  const holdings = await Stock.find({ quantity: { $ne: 0 } }).select('-_id -__v');
  return res.status(200).json(holdings);
}

var getReturns = async (req, res) => {
  const securities = await Stock.find({ quantity: { $ne: 0 } }).select('-_id -__v');
  const returns = securities.reduce((acc, doc) => acc + ((100 - doc.avgBuyPrice) * doc.quantity), 0);
  return res.status(200).json({ returns });
}

module.exports = {
  getPortfolio,
  getHoldings,
  getReturns
};
