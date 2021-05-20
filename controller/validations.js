const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports = {

  add: {
    body: Joi.object({
      tickerSymbol: Joi.string().min(1).uppercase().trim().required(),
      action: Joi.string().uppercase().valid('BUY', 'SELL').trim().required(),
      quantity: Joi.number().min(1).required(),
      price: Joi.number().min(0).default(100),
    }),
  },

  remove: {
    params: Joi.object({
      id: Joi.objectId(),
    }),
  },

  update: {
    body: Joi.object({
      tickerSymbol: Joi.string().min(1).uppercase().trim().required(),
      action: Joi.string().uppercase().valid('BUY', 'SELL').trim().required(),
      quantity: Joi.number().min(1).required(),
      price: Joi.number().min(0).default(100),
    }),
    params: Joi.object({
      id: Joi.objectId(),
    }),
  },

};
