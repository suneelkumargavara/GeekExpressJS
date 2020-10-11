const ErrorResponse = require('../Utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../Models/Course')
const Bootcamp = require('../Models/Bootcamp')
const { use } = require('../Routes/courses')

//@desc GetCourses
//@route GET api/v1/courses
//@route GET api/v1/bootcamps/:bootcampId/courses

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query
  if (req.params.bootcampId) {
    query = await Course.find({ bootCamp: req.params.bootcampId })
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    })
  } else {
    res.status(200).json(res.advancedResults)
  }
})

//@description GetSingleCourse
//@route GET/api/v1/courses/id
//@access public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  let course = Course.findById(id)
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      400
    )
  }
  course = course.populate({
    path: 'bootcamp',
    select: 'name description'
  })
  const result = await course
  res.status(200).json({
    success: true,
    data: result
  })
})

//@description Add a course
//@Route api/v1/course
//@access private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId

  const bootcamp = await Bootcamp.findById(req.params.bootcampId)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp with id ${req.params.bootcampId} not found`),
      404
    )
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} is not authorized to add a course to add a bootcamp to ${bootcamp.id}`
      ),
      401
    )
  }
  req.body.user = bootcamp.user
  const course = await Course.create(req.body)
  res.status(200).json({
    success: true,
    data: course
  })
})

//@descrption UpdateCourse
//@api GET/api/v1/courses/:id
//@access private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  let course = await Course.findById(id)

  if (!course) {
    return next(
      new ErrorResponse(`Unable to find the course with id ${id}`),
      404
    )
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User with id ${req.user.id} has no access to update course with id ${id}`
      ),
      401
    )
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true
  }).populate({
    path: 'bootcamp',
    select: 'name description'
  })

  res.status(200).json({
    success: true,
    data: course
  })
})

//@description Delete Course
//@api GET/api/v1/courses/:id
//@access private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const course = await Course.findById(id)

  if (!course) {
    return next(new ErrorResponse(`Unable to find response with id ${id}`), 404)
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User has no access to delete course with id ${req.user.id}`
      ),
      401
    )
  }

  course.remove()

  res.status(200).json({
    success: true,
    data: {}
  })
})
