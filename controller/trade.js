const Trade = require("../Model/trade.js");
const Stock = require("../Model/stock.js");

const insertStock = async (tickerSymbol, quantity, avgBuyPrice) => {

  let stock = new Stock({
    tickerSymbol,
    quantity,
    avgBuyPrice,
  });

  stock = await stock.save();
  return stock;
};

const insertTrade = async (tickerSymbol, action, quantity, price) => {
  let trade = new Trade({
    tickerSymbol,
    action,
    quantity,
    price,
  });

  trade = await trade.save();
  return trade;
};

const addStock = async (trade) => {
  if (trade.action === 'BUY') {
    const stock = await buySecurity(trade.tickerSymbol, trade.quantity, trade.price);
    return stock;
  }
  const stock = await sellSecurity(trade.tickerSymbol, trade.quantity);
  return stock;
};

const buyStock = async (tickerSymbol, quantity, price) => {

  let stock = await Stock.findOne({ tickerSymbol });

  price = parseInt(price);
  quantity = parseInt(quantity);

  // console.log(typeof(price));
  // console.log(typeof(quantity));

  stock.avgBuyPrice = (stock.avgBuyPrice * stock.quantity + price * quantity) / (stock.quantity + quantity);
  stock.quantity += quantity;

  stock = await stock.save();
  return stock;
};

const sellStock = async (tickerSymbol, quantity) => {
  let stock = await Stock.findOne({ tickerSymbol });
  quantity = parseInt(quantity);

  stock.quantity -= quantity;
  if(stock.quantity == 0){
    stock.avgBuyPrice = 0;
  }
  stock = await stock.save();

  return stock;
};

const removeStock = async (trade, stock) => {
  if (trade.action === 'BUY') {
    stock.avgBuyPrice = ((stock.avgBuyPrice * stock.quantity - trade.price * trade.quantity) / (stock.quantity - trade.quantity)) || 0;
    stock.quantity -= trade.quantity;
    stock = await stock.save();
  } else {
    stock.quantity += trade.quantity;
    stock = await stock.save();
  }
  return stock;
};

const add = async (req, res) => {
    console.log(req.body);
    const { tickerSymbol, action, quantity, price } = req.body;

    let stock = await Stock.findOne({ tickerSymbol });

    if (!stock){
      console.log(`${tickerSymbol} NOT FOUND`);
      stock = await insertStock(tickerSymbol, 0, 0);
    }

    if (stock) {
      if (action === 'BUY') {
        stock = await buyStock(tickerSymbol, quantity, price);
        const trade = await insertTrade(tickerSymbol, action, quantity, price);
        return res.status(201).json(trade);
      }

      var stock_quantity = stock.quantity;
      // quantity = parseInt(quantity);

      if (stock_quantity - quantity >= 0) {
        stock = await sellStock(tickerSymbol, quantity);
        const trade = await insertTrade(tickerSymbol, action, quantity);
        return res.status(201).json(trade);
      }

      console.log(`${tickerSymbol} Insufficient quantity`);
      return res.status(400).json({"Error" : "Insufficient quantity"});
    }
}

const remove = async (req, res) => {
  let trade = await Trade.findById(req.params.id);

  if (!trade)
    return res.status(400).json({"Error" : "Trade with given id not found."});

  let stock = await Stock.findOne({
    tickerSymbol: trade.tickerSymbol
  });

  if (trade.action === 'BUY' && stock.quantity - trade.quantity < 0)
    return res.status(400).json({"Error" : "Insufficient quantity!"});

  stock = await removeStock(trade, stock);

  trade = await Trade.findByIdAndRemove(trade.id);
  return res.status(200).json(trade);
}

const update = async (req, res) => {
    const { tickerSymbol: newTickerSymbol, action: newAction, quantity: newQuantity, price: newPrice } = req.body;

    let trade = await Trade.findById(req.params.id);
    if (!trade)
      return res.status(400).json({"Error" : "Trade with given id not found."});

    if (trade.tickerSymbol !== newTickerSymbol || (trade.tickerSymbol === newTickerSymbol && trade.action !== newAction)) {
      let stock = await Stock.findOne({ tickerSymbol: trade.tickerSymbol });
      if (trade.action === 'BUY' && portfolio.quantity - trade.quantity < 0)
        return res.status(400).json({"Error" : "Sorry, cannot update this trade! Insufficient quantity of shares in portfolio."});

      stock = await removeStock(trade, stock);
      stock = await Stock.findOne({ tickerSymbol: newTickerSymbol });

      if (!stock)
        stock = await insertStock(newTickerSymbol, 0, 0);
      if (newAction === 'BUY') {
        stock = await buyStock(newTickerSymbol, newQuantity, newPrice);

        trade.tickerSymbol = newTickerSymbol;
        trade.action = newAction;
        trade.quantity = newQuantity;
        trade.price = newPrice;
        trade = await trade.save();
        return res.status(200).json(trade);
      }

      if (stock.quantity - newQuantity >= 0) {
        stock = await sellStock(newTickerSymbol, newQuantity);

        trade.tickerSymbol = newTickerSymbol;
        trade.action = newAction;
        trade.quantity = newQuantity;
        trade.price = 100;
        trade = await trade.save();

        return res.status(200).json(trade);
      }

      stock = await addStock(trade);
      return res.status(400).json({"Error" : "Insufficient quantity!"});
    }


    const diff = newQuantity - trade.quantity;
    if (diff === 0 && newPrice === trade.price)
      return res.status(400).json({"Error" : "No Change"});

    let stock = await Stock.findOne({ tickerSymbol: trade.tickerSymbol });
    if (newAction === 'BUY') {
      if (diff < 0 && portfolio.quantity - diff < 0)
        return res.status(400).json({"Error" : "Insufficient quantity!"});

      stock.avgBuyPrice = ((stock.avgBuyPrice * stock.quantity - trade.price * trade.quantity) / (stock.quantity - trade.quantity)) || 0;
      stock.avgBuyPrice = (stock.avgBuyPrice * (stock.quantity - trade.quantity) + newPrice * newQuantity) / (stock.quantity - trade.quantity + newQuantity);
      if (diff === 0) {
        stock = await stock.save();
      } else if (diff > 0) {
        stock.quantity += diff;
        stock = await stock.save();
      } else {
        stock.quantity -= Math.abs(diff);
        stock = await stock.save();
      }
    } else {
      if (diff > 0 && stock.quantity - diff < 0)
        return res.status(400).json({"Error" : "Insufficient quantity!"});
      if (diff > 0) {
        stock.quantity -= diff;
        stock = await stock.save();
      } else {
        stock.quantity += Math.abs(diff);
        stock = await stock.save();
      }
    }

    trade.quantity = newQuantity;
    trade.price = newPrice;
    trade = await trade.save();
    return res.status(200).json(trade);
  }

module.exports = {
  add,
  remove,
  update
};
