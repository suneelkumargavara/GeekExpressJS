const User = require('../Models/User')
const asyncHandler = require('../middleware/async')
const { use } = require('../Routes/auth')

//@description Get All users
//@Route  GET/api/v1/auth/users
//@access Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

//@desription Get Single user
//@Route Get api/v1/auth/users/:id
//@access Private/admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  res.status(200).json({
    success: true,
    user
  })
})

//@description Create user
//@Route Put api/v1/auth/users/:id
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body)
  res.status(201).json({
    success: true,
    data: user
  })
})

//@description  Update user
//@Route Put api/v1/auth/users/:id
//@access Private/Admin

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  res.status(200).json({
    success: true,
    data: user
  })
})

//@description Delete user
//@Route Delete api/v1/users/:id
//@access Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id)
  res.status(200).json({
    success: true,
    data: {}
  })
})
