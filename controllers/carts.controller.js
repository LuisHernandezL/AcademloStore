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
      where: { id: productId },
    });
    if (selectedProduct.quantity < quantity) {
      return next(new AppError('We are out of stock please check again', 400));
    }
    const cart = await ProductInCart.create({
      productId,
      cartId: newCart.id,
    });
  } else {
    const cart = await ProductInCart.findOne({
      where: { cartId: findCart.id },
    });
    if (cart.productId === productId && cart.status === 'active') {
      return next(new AppError('This product already exist in cart', 400));
    } else if (cart.productId === productId && cart.status === 'removed') {
      await ProductInCart.update({
        quantity,
        status: 'active',
      });
    }
  }

  res.status(204).json({
    status: 'success',
    message: 'Product added to cart',
  });
});
const updateCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId, newQty } = req.body;

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
    findProductInCart.status = 'removed';
  } else {
    findProductInCart.quantity = newQty;
    findProductInCart.status = 'active';
  }

  res.status(204).json({});
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

  res.status(204).json({});
});
const purchase = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const findCart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
    include: [{ model: ProductInCart, where: { status: 'active' } }],
  });
  // ! falta la logica de recorrer arreglo, primero probar endpoints y luego crear contenido en la db para poder hacer la logica
  if (!findCart) {
    return next(new AppError('Not active cart found', 400));
  }
});
