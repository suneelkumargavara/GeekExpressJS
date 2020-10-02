const ErrorResponse = require('../Utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../Models/Course')

//@desc GetCourses
//@route GET api/v1/courses
//@route GET api/v1/bootcamps/:bootcampId/courses

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query
  if (req.params.bootcampId) {
    query = Course.find({ bootCamp: req.params.bootcampId })
  } else {
    query = Course.find()
  }
  const courses = await query
  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  })
})
