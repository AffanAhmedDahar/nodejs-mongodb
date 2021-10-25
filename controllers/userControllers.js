const User = require('../model/userModel');
const genrateToken = require('../utils/utils');
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};


const createSendToken = (user, statusCode, res) => {
  const token = genrateToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};


const signup = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
    role,
  });

  console.log(user)
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role : user.role,
      token: genrateToken(user._id)
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
});


const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('please provide email or password');
  }
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(400);
    throw new Error('invalid email or password');
  }
  createSendToken(user, 200, res);
});


const forgotPassword = asyncHandler(async (req, res, next) => {
  // get user by posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(401);
    throw new Error('there is no user with this email');
  }

  // generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password ? Submit a patch request with your new password and passwordConfirm to : ${resetURL}.\n If you don't forgot your password , please ignore this message`;
  await sendEmail({
    email: user.email,
    subject: 'Your password reset token (expires in 10 minutes)',
    message,
  });
  res.status(200).json({
    status: 'success',
    message: 'Token send to email',
  });
});


const resetPassword = asyncHandler(async (req, res, next) => {
  // get user by thhe token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  ///

  if (!user) {
    res.status(404);
    throw new Error('Token is invalid or expired ');
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});


const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!(await user.matchPassword(req.body.passwordCurrent))) {
    res.status(404);
    throw new Error('Invalid password');
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  createSendToken(user, 200, res);
});


const updateMe = asyncHandler(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    res.status(404);
    throw new Error('This route is not for update password');
  }
  // filtered out unwanted fields that are not allowed

  const filteredBody = filterObj(req.body, 'name', 'email');

  // update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateMe,
  deleteMe
};
