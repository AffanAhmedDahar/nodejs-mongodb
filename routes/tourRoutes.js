const express = require('express')
const router = express.Router()
const {getTour , getTours , addTours , updateTour , deleteTour, topTours , getTourStats , getMonthlyPlan} = require('../controllers/tourController')
const {protect, restrictTo} = require('../middleware/authMiddleware')
// router.param('id', checkId)
router.route('/top-5-cheap').get(topTours , getTours)
router.route('/get-Stat').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)
router.route('/').get( getTours).post(addTours)
router.route('/:id').get(getTour).patch(updateTour).delete(protect, restrictTo('admin', 'lead-guide') ,deleteTour)

module.exports = router