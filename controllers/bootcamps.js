const Bootcamp = require("../Models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../Utils/errorResponse");

//@description GetAllBootCamps
//Route GET/api/v1/bootcamps
//@access public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

//@description GetSingleBootcamp
//@Route GET/api/v1/bootcamp/:id
//@access public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const bootcamp = await Bootcamp.findById(id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@description Create new bootcamp
//@route POST/api/v1/bootcamp
//@access public
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

//@description Update bootcamp
//@route PUT/api/v1/bootcamp/:id
//@access public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const bootcamp = await Bootcamp.findOneAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Unable to update bootcamp with Id ${req.params.id}`,
        400
      )
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@description Delete Bootcamp
//@route DELETE/api/v1/delete/:id
//@access public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const bootcamp = await Bootcamp.findByIdAndDelete(id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`unable to delete the bootcamp with id${id}`, 400)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});
