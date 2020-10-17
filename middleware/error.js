const ErrorResponse = require('../Utils/errorResponse')

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  //Log to console for developer
  console.log('Error Is', err)

  //Mongoose bad objectId
  if (err.name === 'CastError') {
    const message = `Resourse not found with id of ${err.value}`
    error = new ErrorResponse(message, 404)
  }

  //Mongoose Duplicate Key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered'
    error = new ErrorResponse(message, 400)
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((value) => value.message)
    error = new ErrorResponse(message, 400)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  })
}

module.exports = errorHandler
