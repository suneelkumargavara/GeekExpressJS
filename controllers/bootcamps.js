const Bootcamp = require("../Models/Bootcamp");
const asyncHandler = require("../middleware/async");
const geocoder = require("../Utils/geocoder");
const ErrorResponse = require("../Utils/errorResponse");

//@description GetAllBootCamps
//Route GET/api/v1/bootcamps
//@access public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  //Copy Query
  let reqQuery = { ...req.query };

  //Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  //Loop over remove fields and delete from query
  removeFields.forEach((param) => delete reqQuery[param]);

  console.log(reqQuery);

  //Create query string
  let queryString = JSON.stringify(reqQuery);

  //Create operators
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  //Finding resource
  query = Bootcamp.find(JSON.parse(queryString));

  //Select
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    sortBy = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //Excecuting query
  const bootcamps = await query;

  //Pagenation result
  const pagenation = {};
  if (endIndex < total) {
    pagenation.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagenation.prev = {
      page: page - 1,
      limit,
    };
  }
  res
    .status(200)
    .json({
      success: true,
      count: bootcamps.length,
      data: bootcamps,
      pagenation,
    });
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
//@desc getBootcamps within a radius
//@route GET api/v1/bootcamps/radius/:zipcode/:distance
//@access private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat/lng
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lon = loc[0].longitude;

  //Calc radius using radien
  //Devide distance by radiusof earth
  //Earth Radius = 3,963 miles
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lon, lat], radius],
      },
    },
  });
  res.status(200).json({ success: true, count: bootcamps.length, bootcamps });
});
