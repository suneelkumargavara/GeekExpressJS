const mongoose = require('mongoose')
const slugify = require('slugify')
const geoCoder = require('../Utils/geocoder')

const BootCampSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  slug: String,
  description: {
    type: String,
    minlength: [0, 'Please Enter Atlease one character']
  },
  phone: {
    type: String,
    minlength: [10, 'Please Enter Atlease 10 characters']
  },
  email: {
    type: String,
    match: [
      /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
      'Please Enter Vaild Email'
    ]
  },
  address: {
    type: String,
    minlength: [0, 'Please Enter valid address']
  },
  careers: [
    {
      type: String,
      enum: [
        'Web Development',
        'UI/UX',
        'Business',
        'Data Science',
        'Mobile Development'
      ],
      required: true
    }
  ],
  housing: Boolean,
  jobAssistance: Boolean,
  jobGuarantee: Boolean,
  acceptGi: Boolean,
  averageCost: Number
})

BootCampSchema.pre('save', async function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

BootCampSchema.pre('save', async function (next) {
  try {
    const loc = await geoCoder.geocode(this.address)
    this.location = {
      type: 'Point',
      coordinates: [loc[0].latitude, loc[0].longitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].state,
      zipCode: loc[0].zipcode,
      country: loc[0].countryCode
    }
    this.address = undefined
  } catch (error) {
    this.location = error
  }
  next()
})

module.exports = mongoose.model('Bootcamp', BootCampSchema)
