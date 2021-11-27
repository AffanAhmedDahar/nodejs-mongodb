const express = require('express')

const router = express.Router()
const {creatRewview , getReviews, deleteReview} = require('../controllers/reviewController')
const { restrictTo, protect } = require('../middleware/authMiddleware')


router.route('/').get(getReviews).post(protect, restrictTo('user'), creatRewview)
router.delete('/:id', deleteReview)


module.exports =  router