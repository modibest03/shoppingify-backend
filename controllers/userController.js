import User from '../models/userModel.js';
import ErrorResponse from '../utils/errorResponse.js';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import History from '../models/historyModel.js';

const createSendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
    //   secure: process.env.NODE_ENV !== "development",
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.setHeader('Set-Cookie', cookie.serialize('auth', token, cookieOptions));

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signUp = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    createSendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new ErrorResponse('Please provide your email and password', 400)
      );
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new ErrorResponse('Incorrect Password or email', 401));
    }

    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res, next) => {
  const cookieOptions = {
    httpOnly: true,
    maxAge: -1, // 1 week
    path: '/',
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.setHeader(
    'Set-Cookie',
    cookie.serialize('auth', 'logout', cookieOptions)
  );
  res.status(200).json({ status: 'success' });
};

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.auth) {
      token = req.cookies.auth;
    }

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token)
      return next(
        new ErrorResponse(
          'You are not logged in Please log in to get access',
          401
        )
      );

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const current = await User.findById(decoded.id);

    if (!current)
      return next(
        new ErrorResponse(
          'The user belonging to this token does no longer exist',
          401
        )
      );

    req.user = current;
    next();
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findByIdAndUpdate(
      _id,
      {
        $push: { cart: { $each: req.body.items } },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'success',
      data: {
        cart: user.cart,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const modifyCartCount = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { id, count } = req.body;
    const cart = await User.updateOne(
      { _id, 'cart._id': id },
      { $set: { 'cart.$.count': count } },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: 'success',
      data: {
        cart,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const modifyCartCompleted = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { id, completed } = req.body;
    const cart = await User.updateOne(
      { _id, 'cart._id': id },
      { $set: { 'cart.$.completed': completed } }
    );

    res.status(200).json({
      message: 'success',
      data: {
        cart,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteItemFromCart = async (req, res, next) => {
  try {
    const { _id } = req.user;

    const user = await User.findByIdAndUpdate(
      _id,
      {
        $pull: { cart: { _id: req.body.id } },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'success',
      data: {
        cart: user.cart,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addToHistory = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { name, complete } = req.body;

    const oldUser = await User.findById(_id);

    const history = await History.create({
      name,
      complete,
      userId: _id,
      shoppingHistory: oldUser.cart,
    });

    oldUser.cart.length = 0;

    await oldUser.markModified('cart');
    await oldUser.save({ validateBeforeSave: false });

    res.status(201).json({
      message: 'success',
      data: {
        history,
      },
    });
  } catch (err) {
    next(err);
  }
};
