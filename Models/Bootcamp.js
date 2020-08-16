const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../Utils/geocoder");

const Bootcampschema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  slug: String,
  description: {
    type: String,
    minlength: [0, "Please Enter atleast one character"],
  },
  phone: {
    type: String,
    minlength: [10, "Please Enter atlease 10 characters"],
  },
  email: {
    type: String,
    match: [
      /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
      "Please Enter Valid Email",
    ],
  },
  address: {
    type: String,
    minlength: [0, "Please Enter Valid Address"],
  },
  careers: [
    {
      type: String,
      enum: [
        "Web Development",
        "UI/UX",
        "Business",
        "Data Science",
        "Mobile Development",
      ],
      require: true,
    },
  ],
  housing: Boolean,
  jobAssistance: Boolean,
  jobGuarantee: Boolean,
  acceptGi: Boolean,
  averageCost: Number,
});

// //Create bootcamp slug from schema
// Bootcampschema.pre("save", function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

//Geocode and locationField
Bootcampschema.pre("save", async function (next) {
  try {
    const loc = await geocoder.geocode(this.address);
    this.location = {
      type: "Point",
      coordinates: [loc[0].latitude, loc[0].longitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].state,
      zipCode: loc[0].zipcode,
      country: loc[0].countryCode,
    };
    this.address = undefined;
  } catch (error) {
    this.location = error;
  }
  next();
});

module.exports = mongoose.model("Bootcamp", Bootcampschema);
