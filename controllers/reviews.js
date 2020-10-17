const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../Utils/errorResponse')
const Review = require('../Models/Review')
const Bootcamp = require('../Models/Bootcamp')

//@desc Get reviews
//@route GET /api/v1/reviews
//@route GET /api/v1/bootcamps/:bootcampId/reviews
//@access public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId })
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    })
  } else {
    res.status(200).json(res.advancedResults)
  }
})

//@desc Get Single Review
//@route GET /api/v1/review/:id
//@route Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const review = await Review.findById(id).populate({
    path: 'bootcamp',
    select: 'name description'
  })
  if (!review) {
    return next(new ErrorResponse(`unable to find review with id ${id}`), 401)
  }
  res.status(200).json({
    success: true,
    review
  })
})

//@desc Create Review
//@route POST/api/v1/bootcamps/:bootcampId/reviews
//@access private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId
  req.body.user = req.user.id
  const bootcamp = await Bootcamp.findById(req.params.bootcampId)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`),
      404
    )
  }
  const review = await Review.create(req.body)
  res.status(200).json({
    success: true,
    data: review
  })
})

//@desc UpdateReview
//@route PUT/api/v1/reviews/:id
//@access Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const reviewId = req.params.id
  const body = req.body
  const review = await Review.findByIdAndUpdate(reviewId, body, { new: true })
  if (!review) {
    return next(new ErrorResponse(`Review with id ${reviewId} not found`), 401)
  }
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`not authorized to update review`), 401)
  }
  res.status(201).json({
    success: true,
    data: review
  })
})

//@desc DeleteReview
//@route DELETE/api/v1/reviews/:id
//@access Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const reviewId = req.params.id
  const body = req.body
  const review = await Review.findByIdAndUpdate(reviewId, body, { new: true })
  if (!review) {
    return next(new ErrorResponse(`Revuew With id ${reviewId} not found`), 401)
  }
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`not authorized to update review ${reviewId}`),
      401
    )
  }
  res.status(201).json({
    success: true
  })
})
