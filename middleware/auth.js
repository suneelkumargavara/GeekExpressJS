const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const ErrorResponse = require('../Utils/errorResponse')
const User = require('../Models/User')

// Protect Route
exports.protect = asyncHandler(async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.token) {
    token = req.cookies.token
  }
  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('not authorized to access this route'), 401)
  }

  //Verify Token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decoded)
    req.user = await User.findById(decoded.id)
    console.log(`Error of user is ${req.user}`.violet)
    next()
  } catch (error) {
    return next(new ErrorResponse('invalid Token'), 400)
  }
})

// Grant access to specific Role

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authrozied to this route`
        ),
        401
      )
    }
    next()
  }
}
