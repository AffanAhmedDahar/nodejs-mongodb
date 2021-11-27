const Review = require('../model/reviewModel');
const asyncHandler = require('express-async-handler');
const factory = require('../utils/factoryFunction')
const creatRewview = asyncHandler(async (req, res) => {

  console.log('hello')
  console.log(req.body)
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


const getReviews = asyncHandler(async (req,res)=> {

  console.log('hello 3')
  try {

    const reviews = await Review.find({})
    console.log(reviews)
    if(!reviews){
      throw new Error('No reviews found', 404)
    }
    res.status(200).json({
      status: 'success',
      reviews,
    })
  }catch (err){
    res.status(400).json({
      status : 'error',
      message : err
    })
  }
})

const deleteReview = factory.deleteOne(Review)

module.exports = {getReviews , creatRewview , deleteReview}