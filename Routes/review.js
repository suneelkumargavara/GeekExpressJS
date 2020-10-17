const express = require('express')

const Review = require('../Models/Review')
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviews')
const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')
const router = express.Router({ mergeParams: true })

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp',
      select: 'name description'
    }),
    getReviews
  )
  .post(protect, authorize('publisher'), addReview)
router
  .route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview)

module.exports = router
