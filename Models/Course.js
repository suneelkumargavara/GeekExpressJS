const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add course Title']
  },
  description: {
    type: String,
    required: [true, 'Please Add description']
  },
  weeks: {
    type: Number,
    required: [true, 'Please add number of week']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipsAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tuition: {
    type: Number,
    required: false
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  }
})

//Static method to get average cost of tuition
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' }
      }
    }
  ])
  try {
    const averageCost = Math.ceil(obj[0].averageCost / 10) * 10
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost
    })
  } catch (error) {}
}

//Call get average cost after saving
CourseSchema.post('save', async function () {
  this.constructor.getAverageCost(this.bootcamp)
})

//Call delete average cost after deleting
CourseSchema.pre('remove', async function () {
  this.constructor.getAverageCost(this.bootcamp)
})

module.exports = mongoose.model('Course', CourseSchema)
