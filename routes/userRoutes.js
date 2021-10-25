const express = require('express')
const router = express.Router()
const {protect, restrictTo} = require('../middleware/authMiddleware')

const {signup , login , forgotPassword , updateMe, resetPassword , updatePassword , deleteMe} = require('../controllers/userControllers')

router.post('/signup',signup)
router.post('/login' , login)
router.post('/forgetpassword' , forgotPassword)
router.patch('/resetPassword/:token' , resetPassword)
router.patch('/updateMyPassword' , protect, updatePassword)
router.patch('/updateMe' , protect, updateMe)
router.patch('/deleteMe' , protect, deleteMe)

module.exports = router