const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel')

const protect = asyncHandler(async (req, res, next) => {
  // get token

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
      // verify token 
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('invalid token, please login again');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('You are not logged in ! please login to get access');
  }
});

const restrictTo = (...roles) => {
    return ( req, res , next) => {
        if(!roles.includes(req.user.role)) {
            res.status(403)
            throw new Error('You do not have permission to access this')
        }
        next()
    }
}
module.exports = { protect , restrictTo};
