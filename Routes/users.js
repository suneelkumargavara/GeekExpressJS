const express = require('express')
const router = express.Router()
const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

const {
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users')
const User = require('../Models/User')

router.use(protect)

router.use(authorize('admin'))

router.route('/').get(advancedResults(User), getUsers).post(createUser)

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser)

module.exports = router
