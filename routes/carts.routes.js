const express = require('express');

// Controllers

// Middlewares
const { protectSession } = require('../middlewares/auth.middleware');

const cartsRouter = express.Router();

cartsRouter.use(protectSession);

cartsRouter.post('/');

cartsRouter.patch('/update-cart');

cartsRouter.delete('/:productId', getUserPurchases);
cartsRouter.post('/purchases', getOrderById);

module.exports = { cartsRouter };
