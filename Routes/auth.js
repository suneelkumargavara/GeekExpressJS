const express = require('express')
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logOutUser
} = require('../controllers/auth')

const router = express.Router()

const { protect } = require('../middleware/auth')

router.post('/register', register)

router.post('/login', login)

router.get('/logout', logOutUser)

router.get('/getMe', protect, getMe)

router.put('/updateDetails', protect, updateDetails)

router.post('/forgotPassword', forgotPassword)

router.put('/resetPassword/:resetToken', resetPassword)

router.put('/updatePassword', protect, updatePassword)

module.exports = router
