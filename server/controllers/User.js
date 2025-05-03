import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createError } from "../error.js";
import User from "../models/User.js";
import Orders from "../models/Orders.js";
import mongoose from "mongoose";

dotenv.config();

//user register controller
export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, name, img } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(409, "Email is already in use"));
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedpassword = bcrypt.hashSync(password, salt);

    const user = new User({
      name,
      email,
      password: hashedpassword,
      img,
    });
    const createduser = await user.save();
    const token = jwt.sign({ id: createduser._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

//user login controller
export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(createError(404, "user not found"));
    }

    const isPasswordCorrect = await bcrypt.compareSync(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return next(createError(403, "Incorrect password"));
    }
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });
    return res.status(200).json({ token, user: existingUser });
  } catch (error) {
    return next(error);
  }
};

// Cart
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userJWT = req.user;

    if (!productId) {
      return next(createError(400, "Product ID is required"));
    }

    if (!mongoose.isValidObjectId(productId)) {
      return next(createError(400, "Invalid product ID format"));
    }

    if (!quantity || quantity <= 0) {
      return next(createError(400, "Quantity must be greater than 0"));
    }

    const user = await User.findById(userJWT.id);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const existingCartItemIndex = user.cart.findIndex((item) =>
      item?.product?.equals(productId)
    );

    if (existingCartItemIndex !== -1) {
      // Product is already in the cart, update the quantity
      user.cart[existingCartItemIndex].quantity += quantity;
    } else {
      // Product is not in the cart, add it
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "Product added to cart successfully", user });
  } catch (err) {
    console.error("Error in addToCart:", err);
    return next(
      createError(500, "Failed to add product to cart: " + err.message)
    );
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const productIndex = user.cart.findIndex((item) =>
      item.product.equals(productId)
    );
    if (productIndex !== -1) {
      if (quantity && quantity > 0) {
        user.cart[productIndex].quantity -= quantity;
        if (user.cart[productIndex].quantity <= 0) {
          user.cart.splice(productIndex, 1);
        }
      } else {
        user.cart.splice(productIndex, 1);
      }

      await user.save();
      return res
        .status(200)
        .json({ message: "Product quantity updated in cart", user });
    } else {
      return next(createError(404, "Product not found in the user's cart"));
    }
  } catch (err) {
    next(err);
  }
};

export const getAllCartItems = async (req, res, next) => {
  try {
    const userJWT = req.user;
    if (!userJWT || !userJWT.id) {
      return next(createError(401, "User not authenticated"));
    }

    const user = await User.findById(userJWT.id);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    try {
      const populatedUser = await User.findById(userJWT.id).populate({
        path: "cart.product",
        model: "Products",
      });

      if (!populatedUser) {
        return next(createError(404, "Failed to populate cart items"));
      }

      const cartItems = populatedUser.cart;
      return res.status(200).json(cartItems);
    } catch (populateError) {
      console.error("Error populating cart items:", populateError);
      return next(
        createError(
          500,
          "Error populating cart items: " + populateError.message
        )
      );
    }
  } catch (err) {
    console.error("Error in getAllCartItems:", err);
    return next(createError(500, "Failed to fetch cart items: " + err.message));
  }
};

// Order

export const placeOrder = async (req, res, next) => {
  try {
    const { products, address, totalAmount } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);
    const order = new Orders({
      products,
      user: user._id,
      total_amount: totalAmount,
      address,
    });
    await order.save();

    user.cart = [];
    await user.save();

    return res
      .status(200)
      .json({ message: "Order placed successfully", order });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const user = req.user;
    const orders = await Orders.find({ user: user.id });
    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

//Favourite

export const addToFavorites = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);

    if (!user.favourites.includes(productId)) {
      user.favourites.push(productId);
      await user.save();
    }

    return res
      .status(200)
      .json({ message: "Product added to favorites successfully", user });
  } catch (err) {
    next(err);
  }
};

export const removeFromFavorites = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);

    user.favourites = user.favourites.filter((fav) => !fav.equals(productId));
    await user.save();
    return res
      .status(200)
      .json({ message: "Product removed from favorites successfully", user });
  } catch (err) {
    next(err);
  }
};

export const getUserFavourites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("favourites").exec();

    if (!user) {
      return next(createError(404, "User not found"));
    }

    return res.status(200).json(user.favourites);
  } catch (err) {
    next(err);
  }
};
