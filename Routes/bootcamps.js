const express = require('express')
const router = express.Router()

const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsWithinRadius,
  bootcampPhotoUpload
} = require('../controllers/bootcamps')

const Bootcamp = require('../Models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

const courseRouter = require('./courses')
const reviewRouter = require('./review')

router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter)

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp)

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp)

router.route('/radius/:zipcode/:distance').get(getBootcampsWithinRadius)

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

module.exports = router
