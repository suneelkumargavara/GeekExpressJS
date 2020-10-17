const ErrorResponse = require('../Utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../Models/User')
const sendEmail = require('../Utils/SendEmail')
const crypto = require('crypto')

//@desc Register User
//@route GET/api/v1/auth/register
//@access Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body

  //Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  })

  //Create Token
  sendTokenResponse(user, 200, res)
})

//@description Login User
//@route POST /api/v1/auth/login
//@access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  // Validate Email and password
  if (!email || !password) {
    return next(new ErrorResponse('please provide an email and password', 400))
  }
  // Check for the user
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  // Check if password password
  const isMatch = await user.matchPassword(password)
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }
  // Create token
  sendTokenResponse(user, 200, res)
})

//@description LogUserOut/Clear Cookie
//@route Get api/v1/auth/logout
//@access private
exports.logOutUser = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })

  res.status(200).json({
    success: true,
    data: {}
  })
})

//@description GetMe
//@route GET/api/v1/auth/getMe
//@access private
exports.getMe = asyncHandler(async (req, res, next) => {
  const id = req.user.id
  const user = await User.findById(id)
  if (!user) {
    return next(ErrorResponse('unable to find the user'), 401)
  }
  res.status(200).json({
    success: true,
    response: user
  })
})

//@description Reset password
//@Route POST/api/v1/auth/forgotPassword
//@access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(
      new ErrorResponse(`There is no user with email ${req.body.email}`),
      401
    )
  }
  // Get reset password token
  const resetToken = user.getResetPasswordToken()
  await user.save({ validateBeforeSave: false })

  // Create reset URL
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetPassword/${resetToken}`

  const message = `You are receiving this email because you(or someone else) has requested the reset of password. Please make a PUT request to: \n\n ${resetURL}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    })
    res.status(200).json({ success: true, data: 'Email sent' })
  } catch (error) {
    console.log(error)
    user.getResetPasswordToken = undefined
    user.getResetPasswordExpire = undefined
    await user.save({ validateBeforeSave: false })
    return next(new ErrorResponse('Email could not be sent'), 401)
  }
})

//@desc Reset Password
//@route PUT /api/v1/auth/resetpassword/:resetToken
//@access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get Hashed Token
  const resetToken = req.params.resetToken
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now()
    }
  })

  if (!user) {
    return next(new ErrorResponse(`Invalid token`), 400)
  }
  //Set new password
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  sendTokenResponse(user, 200, res)
})

//@description Update user details
//@route PUT /api/v1/auth/updateDetails
//@access Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    user
  })
})

//@description UpdatePassword
//@route PUT /api/v1/updatePassword
//@access Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')
  const currentPassword = req.body.currentPassword
  const isPasswordMatched = await user.matchPassword(currentPassword)

  //Check current Password
  if (!isPasswordMatched) {
    return next(new ErrorResponse(`Password is incorrect`), 401)
  }
  user.password = req.body.newPassword
  await user.save()

  sendTokenResponse(user, 200, res)
})

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJWTToken()

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }
  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token
  })
}
