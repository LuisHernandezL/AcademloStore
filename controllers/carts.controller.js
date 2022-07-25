//models
const { Cart } = require('../models/cart.model');

const { ProductInCart } = require('../models/productInCart.model');
const { Product } = require('../models/product.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

//Functions
const addProduct = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId, quantity } = req.body;
  const findCart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  if (!findCart) {
    const newCart = await Cart.create({
      userId: sessionUser.id,
    });
    const selectedProduct = await Product.findOne({
      where: { id: productId, status: 'active' },
    });
    if (!selectedProduct) {
      return next(new AppError('This product its not available'));
    }
    if (selectedProduct.quantity < quantity) {
      return next(new AppError('We are out of stock please check again', 400));
    }
    const cart = await ProductInCart.create({
      cartId: newCart.id,
      productId: selectedProduct.id,
      quantity,
    });
    res.status(201).json({
      status: 'success',
      message: 'Product added to cart and cart created',
      cart,
    });
  } else {
    const cart = await ProductInCart.findOne({
      where: { cartId: findCart.id },
    });
    if (cart.dataValues.productId === productId && cart.status === 'active') {
      return next(new AppError('This product already exist in cart', 400));
    } else if (
      cart.dataValues.productId === productId &&
      cart.dataValue.status === 'removed'
    ) {
      await cart.update({
        quantity,
        status: 'active',
      });
    } else if (cart.dataValues.productId !== productId) {
      const createProductIncart = await ProductInCart.create({
        cartId: cart.dataValues.id,
        productId,
        quantity,
      });
    }
    res.status(201).json({
      status: 'success',
      message: 'Product added to cart',
      cart,
    });
  }
});

const updateCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId, quantity: newQty } = req.body;

  const findCart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  if (!findCart) {
    return next(new AppError('This user dont have a active cart', 400));
  }

  const findProductInCart = await ProductInCart.findOne({
    where: { cartId: findCart.id, status: 'active' },
  });

  if (!findProductInCart) {
    return next(new AppError('This user dont have this product on cart', 400));
  }

  const productQty = await Product.findOne({
    where: { id: productId },
  });
  if (productQty.quantity < newQty) {
    return next(new AppError('this product is out of stock', 400));
  }

  if (newQty === 0) {
    await findProductInCart.update({
      status: 'removed',
    });
  } else {
    await findProductInCart.update({
      quantity: newQty,
      status: 'active',
    });
  }

  res.status(201).json({
    findProductInCart,
  });
});
const deleteProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { sessionUser } = req;

  const findCart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  if (!findCart) {
    return next(new AppError('Not active cart found', 400));
  }
  const findProductInCart = await ProductInCart.findOne({
    where: { productId, status: 'active', cartId: findCart.id },
  });

  if (!findProductInCart) {
    return next(new AppError('Not product found in cart', 400));
  }

  await findProductInCart.update({
    quantity: 0,
    status: 'removed',
  });

  res.status(204).json({});
});
const purchase = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const findCart = await Cart.findAll({
    where: { userId: sessionUser.id, status: 'active' },
    attributes: ['id', 'userId', 'status'],
    include: [
      {
        model: ProductInCart,
        where: { status: 'active' },
        attributes: ['id', 'cartId', 'productId', 'quantity', 'status'],
        required: false,
        include: [
          {
            model: Product,
            required: false,
            where: { status: 'active' },
            attributes: [
              'title',
              'description',
              'price',
              'categoryId',
              'quantity',
            ],
          },
        ],
      },
    ],
  });
  if (!findCart) {
    return next(new AppError('Not active cart found', 400));
  }

  res.status(200).json({
    findCart,
  });
});

module.exports = { addProduct, updateCart, deleteProduct, purchase };
