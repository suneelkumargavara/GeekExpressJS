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

const courseRouter = require('./courses')

router.use('/:bootcampId/courses', courseRouter)

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(createBootcamp)

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

router.route('/radius/:zipcode/:distance').get(getBootcampsWithinRadius)

router.route('/:id/photo').put(bootcampPhotoUpload)

module.exports = router
