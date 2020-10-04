const ErrorResponse = require('../Utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../Models/Course')
const Bootcamp = require('../Models/Bootcamp')

//@desc GetCourses
//@route GET api/v1/courses
//@route GET api/v1/bootcamps/:bootcampId/courses

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query
  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId })
  } else {
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description'
    })
  }
  const courses = await query
  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  })
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
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const course = await Course.findById(id)

  if (!course) {
    return next(new ErrorResponse(`Unable to find response with id ${id}`), 404)
  }
  course.remove()

  res.status(200).json({
    success: true,
    data: {}
  })
})
