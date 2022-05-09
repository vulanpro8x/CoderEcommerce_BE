const httpStatus = require("http-status");
const { Types } = require("mongoose");
const { AppError } = require("../helpers/utils");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const productService = require("./product.service");

const cartItemService = {};

cartItemService.getAllCartItemByCartId = async function (cartId) {
  let query = { cartId, populate: "productId", select: "-_id -cartId" };

  const cartItem = await CartItem.paginate(query);

  return { ...cartItem };
};

cartItemService.updateCartItem = async function (userId, cartItemBody) {
  const { productId, operator } = cartItemBody;

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Cart is not found",
      "Add item to cart"
    );
  }

  const product = await productService.checkExistProduct(productId);

  if (!product) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Product is not found",
      "Add item to cart"
    );
  }

  let cartitem = await CartItem.findOne({ cartId: cart._id, productId });

  if (operator && cartitem) {
    operator === "+" ? (cartitem.quantity += 1) : (cartitem.quantity -= 1);

    await cartitem.save();
    return;
  }

  if (!cartitem) {
    cartitem = { cartId: cart._id, productId, quantity: 1 };

    await CartItem.create(cartitem);
  }
};

cartItemService.deleteCartItem = async function (userId, cartItemBody) {
  let { productId } = cartItemBody;

  let arrProductId = productId.map((e) => Types.ObjectId(e));

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Cart is not found",
      "Add item to cart"
    );
  }

  const cartItem = await CartItem.find({
    cartId: cart._id,
    productId: { $in: arrProductId },
  });

  if (cartItem.length !== arrProductId.length || !cartItem.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Product is not found",
      "Delete item of cart"
    );
  }

  await CartItem.deleteMany({
    cartId: cart._id,
    productId: { $in: arrProductId },
  });
};

module.exports = cartItemService;
