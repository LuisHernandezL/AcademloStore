const express = require('express')

const productsRouter = express.Router()

//Middleware
const { protectSession } = require('../middlewares/auth.middleware')
const { productExist } = require('../middlewares/productExist.middleware')

//Controllers
const {
    newProduct,
    allProducts,
    productById,
    updateProduct,
    deleteProduct,
    productsCategories,
    newCategorie,
    updateCategorie
} = require('../controllers/products.controller')

productsRouter.get('/', allProducts)
productsRouter.get('/:id',productExist, productById)
productsRouter.get('/categories', productsCategories)

//protected end points
productsRouter.use(protectSession)

productsRouter.post('/', newProduct)
productsRouter.patch('/:id',productExist, updateProduct)
productsRouter.delete('/:id',productExist, deleteProduct)
productsRouter.post('/categories', newCategorie)
productsRouter.patch('/categories/:id', updateCategorie)

module.exports = { productsRouter }