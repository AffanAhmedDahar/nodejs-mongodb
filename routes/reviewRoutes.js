const express = require('express')

const router = express.Router()
const {creatRewview , getReviews} = require('../controllers/reviewController')
const { restrictTo, protect } = require('../middleware/authMiddleware')


router.route('/').get(getReviews).post(protect, restrictTo('user'), creatRewview)


module.exports =  router