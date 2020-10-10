const Bootcamp = require('../Models/Bootcamp')
const asyncHandler = require('../middleware/async')
const geoCoder = require('../Utils/geocoder')
const ErrorResponse = require('../Utils/errorResponse')
const path = require('path')

//@description GetAllBootcamps
//@Route GET/api/v1/bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
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

//@description DeleteBootcamp
//@route api/vi/bootcamp/:id
//@access public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const bootcamp = await Bootcamp.findById(id)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Unable to delete the bootcamp with id ${id}`, 400)
    )
  }

  bootcamp.remove()

  res.status(200).json({ success: true })
})

//@description GetBootcampsWithinRegion
//@route GET/api/v1/bootcamps/radius/:zipcode/:distance
//@access private

exports.getBootcampsWithinRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params
  //Get lat and lng fro geocoder
  const loc = await geoCoder.geocode(zipcode)
  const lat = loc[0].latitude
  const lng = loc[1].longitude

  //Calc radius using radians
  //Device distance by radius of the Earth
  //Earth Radius = 3963 miles
  const radius = distance / 3963
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  })
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  })
})

//@description upload photo for bootcamp
//@route PUT/api/v1/bootcamps/:id/photo
//@access private

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const bootcamp = await Bootcamp.findById(id)
  if (!bootcamp) {
    return next(new ErrorResponse(`unable to find bootcamp with id ${id}`, 404))
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file'), 400)
  }
  const { file } = req.files

  //Make sure uploaded mime type is image
  const isUploadedFileisAnImage = file.mimeType.startsWith('image')
  if (!isUploadedFileisAnImage) {
    return next(new ErrorResponse('Please upload an image', 400))
  }
  //Make sure image size is less than maximum size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `image size should not be greater than ${process.env.MAX_FILE_UPLOAD}`
      )
    )
  }
  //Create Custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err)
      return next(new ErrorResponse('Problem with file upload', 500))
    }
    await Bootcamp.findByIdAndUpdate(id, { photo: file.name })
    res.status(200).json({
      success: true,
      data: file.name
    })
  })
})
