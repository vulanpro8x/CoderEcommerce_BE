const httpStatus = require("http-status");
const { AppError, SearchOptions, catchAsync } = require("../helpers/utils");
const User = require("../models/User");
const cartService = require("./cart.service");

const userService = {};
/**
 *
 * @param {String} email
 * @param {String} excludeUserId
 * @returns {Boolean}
 *
 */

userService.checkEmailTaken = async function (filter) {
  const user = await User.findOne(filter);

  return !!user;
};

userService.getUserByFilter = async function (filter, options) {
  const user = await User.findOne(filter, options).populate("cartId");

  return user;
};

userService.getUserById = async function (userId) {
  const user = await User.findById(userId).populate("cartId");
  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User is not found",
      "Get single user"
    );
  }
  return user;
};

userService.getAllUsersList = async function (query) {
  // query.populate = "CreditCards."

  if (query.name) {
    query.name = { $regex: query.name, $options: "i" };
  } else {
    delete query.name;
  }
  const users = await User.paginate(query);
  return users;
};

userService.createUser = async function (userBody) {
  const { email } = userBody;

  const isExits = await userService.checkEmailTaken({ email });
  if (isExits) {
    throw new AppError(
      404,
      "Email is Exist, Please login or reset password",
      "Create new User"
    );
  }

  const user = await new User({ ...userBody }).save();

  const cart = await cartService.createCart(user._id);

  user.cartId = cart._id;

  await user.save();

  return user;
};

userService.updateUserById = async function (userId, userBody) {
  let user = await User.findById(userId);
  console.log(user);
  if (!user) {
    throw new AppError(404, "User Not Found", "Update current User");
  }

  user.isResetPassword = false;

  Object.keys(userBody).forEach((field) => {
    if (userBody[field] !== undefined) {
      user[field] = userBody[field];
    }
  });

  await user.save();
};

userService.deleteUserById = async function (userId) {
  const user = await User.findByIdAndUpdate(userId, { isDeleted: true });
  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User is not found",
      "Delete single user"
    );
  }
};

module.exports = userService;
