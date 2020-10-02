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
  bootCamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  }
})

module.exports = mongoose.model('Course', CourseSchema)
