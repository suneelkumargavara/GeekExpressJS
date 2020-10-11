const express = require('express')
const router = express.Router({ mergeParams: true })
const Course = require('../Models/Course')

const { protect, authorize } = require('../middleware/auth')

const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courses')
const advancedResults = require('../middleware/advancedResults')

router
  .route('/')
  .get(advancedResults(Course, 'bootCamp'), getCourses)
  .post(protect, authorize('publisher', 'admin'), addCourse)
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse)
module.exports = router
