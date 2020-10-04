const express = require('express')
const router = express.Router()

const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsWithinRadius
} = require('../controllers/bootcamps')

router.route('/radius/:zipcode/:distance').get(getBootcampsWithinRadius)

const courseRouter = require('./courses')

router.use('/:bootcampId/courses', courseRouter)

router.route('/').get(getBootcamps).post(createBootcamp)

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

module.exports = router
