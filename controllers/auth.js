const ErrorResponse = require('../Utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../Models/User')

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
