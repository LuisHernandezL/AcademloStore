const express = require('express');

const productsRouter = express.Router();

//Middleware
const {
  protectSession,
  protectUserAccount,
} = require('../middlewares/auth.middleware');
const { productExist } = require('../middlewares/productExist.middleware');

//Controllers
const {
  newProduct,
  allProducts,
  productById,
  updateProduct,
  deleteProduct,
  productsCategories,
  newCategorie,
  updateCategorie,
} = require('../controllers/products.controller');

//utils
const {
  createProductValidators,
} = require('../middlewares/validators.middleware');

productsRouter.get('/', allProducts);
productsRouter.get('/:id', productExist, productById);
productsRouter.get('/categories', productsCategories);

//protected end points
productsRouter.use(protectSession);

productsRouter.post('/', createProductValidators, newProduct);
productsRouter.patch('/:id', protectUserAccount, productExist, updateProduct);
productsRouter.delete('/:id', protectUserAccount, productExist, deleteProduct);
productsRouter.post('/categories', newCategorie);
productsRouter.patch('/categories/:id', updateCategorie);

module.exports = { productsRouter };
