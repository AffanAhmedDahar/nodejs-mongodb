const Review = require('../model/reviewModel');
const asyncHandler = require('express-async-handler');

const creatRewview = asyncHandler(async (req, res) => {
  try {
    const review = await Review.create(req.body);
    if (review) {
      res.status(201).json({
        status: 'success',
        review,
      });
    }
    throw new Error('Could not create review try again');
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err,
    });
  }
});
