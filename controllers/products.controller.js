//Db
const { db, DataTypes } = require('../utils/database.util')

//Models
const { Product } = require('../models/product.model')
const { ProductImg } = require('../models/productImg.model')
const { Categorie } = require('../models/categorie.model')

//Utils
const { AppError } = require('../utils/appError.util')
const { catchAsync } = require('../utils/catchAsync.util')

const newProduct = catchAsync(async(req, res, next) => {
    const { title, description, price, categoryId, quantity } = req.body

    const categoryExist = await Categorie.findOne({where: { categoryId }})

    if(!categoryExist){
        return next(new AppError('Categorie not exist', 400))
    }

    const data = await Product.create({
        title,
        description,
        price,
        categoryId,
        quantity
    })

    res.status(201).json({
        status: 'success',
        data
    })

})

const allProducts = catchAsync(async(req, res, next) => {
    const data = await Product.findAll({where: { status: 'active' }})

    res.status(200).json({
        status: 'success',
        data
    })
})

const productById = catchAsync(async(req, res, next) => {
    const { product } = req

    res.status(200).json({
        status: 'success',
        product
    })
})

const updateProduct = catchAsync(async(req, res, next) => {
    const { product } = req
    const { title, description, price, quantity } = req.body

    await product.update({
        title,
        description,
        price,
        quantity
    })

    res.status(204)
})

const deleteProduct = catchAsync(async(req, res, next) => {
    const { product } = req

    await product.update({
        status: 'deleted'
    })

    res.status(204)
})

const productsCategories = catchAsync(async(req, res, next) => {
    
})

const newCategorie = catchAsync(async(req, res, next) => {
    const { name } = req.body

    const data = await Categorie.create({
        name
    })

    res.status(201).json({
        status: 'success',
        data
    })
})

const updateCategorie = catchAsync(async(req, res, next) => {
    const { id } = req.params
    const { name } = req.body

    const categorie = await Categorie.findOne({where: { id }})

    if (!categorie){
        return next( new AppError('Categorie not found', 400))
    }

    await categorie.update({
        name
    })

    res.status(204)
})

module.exports = {
    newProduct,
    allProducts,
    productById,
    updateProduct,
    deleteProduct,
    productsCategories,
    newCategorie,
    updateCategorie
}