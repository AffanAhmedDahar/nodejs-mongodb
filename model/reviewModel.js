const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'review can not be empty'],
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'tour',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
  },
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

module.exports = mongoose.model('review', reviewSchema);
