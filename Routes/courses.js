const express = require('express')
const router = express.Router({ mergeParams: true })
const Course = require('../Models/Course')

const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteBootcamp
} = require('../controllers/courses')
const advancedResults = require('../middleware/advancedResults')

router
  .route('/')
  .get(advancedResults(Course, 'bootCamp'), getCourses)
  .post(addCourse)
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteBootcamp)
module.exports = router
