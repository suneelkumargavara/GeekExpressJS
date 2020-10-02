const Bootcamp = require('../Models/Bootcamp')
const asyncHandler = require('../middleware/async')
const geoCoder = require('../Utils/geocoder')
const ErrorResponse = require('../Utils/errorResponse')
const { raw } = require('express')

//@description GetAllBootcamps
//@Route GET/api/v1/bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query
  let reqQuery = { ...req.query }
  //Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit']
  //Loop over and remove fields from query
  removeFields.forEach((param) => delete reqQuery[param])
  console.log(reqQuery)

  //Create query string
  let queryString = JSON.stringify(reqQuery)

  //Create Operators
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  )

  query = Bootcamp.find(JSON.parse(queryString))

  //Select
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    query.select(fields)
  }
  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    sortBy = sortBy.sort(sortBy)
  } else {
    query = query.sort('-createdAt')
  }
  //Pagination
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 25
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await Bootcamp.countDocuments()
  query = query.skip(startIndex).limit(limit)

  //Excecuting query

  const bootcamps = await query

  //Pagenation Result
  const pagenation = {}
  if (endIndex < total) {
    pagenation.next = {
      page: page + 1,
      limit
    }
  }
  if (startIndex > 0) {
    pagenation.prev = {
      page: page - 1,
      limit
    }
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
    pagenation
  })
})

//@description GETSingleBootcamp
//@route /api/v1/bootcamp/:id
//@access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id
  const bootcamp = await Bootcamp.findById(id)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404)
    )
  }
  res.status(200).json({
    success: true,
    data: bootcamp
  })
})

//@description create bootcamp
//@route api/vi/bootcamp
//@access public
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body)
  res.status(201).json({ success: true, data: bootcamp })
})

//@description Update Bootcamp
//@route api/v1/bootcamp
//@access public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  })
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Unable to update bootcamp with id ${req.param.id}`,
        400
      )
    )
  }
  res.status(200).json({
    success: true,
    data: bootcamp
  })
})

//@description DeleteaBootcamp
//@route api/vi/bootcamp/:id
//@access public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const bootcamp = await Bootcamp.findByIdAndDelete(id)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Unable to delete the bootcamp with id ${id}`, 400)
    )
  }
  res.status(200).json({ success: true, data: bootcamp })
})

//@desc GetBootcamps within a radius
//@route api/v1/bootcamps/radius/:c/:distance
//@access Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params
  //Get latitude and longitude
  const loc = await geoCoder.geocode(zipcode)
  const lat = loc[0].latitude
  const lon = loc[0].longitude

  //Calculate Radius using radien
  const radius = distance / 3963

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lon, lat], radius]
      }
    }
  })
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    bootcamps
  })
})
