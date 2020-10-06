const express = require('express')
const router = express.Router({ mergeParams: true })
const { getCourses } = require('../controllers/courses')
const advancedResults = require('../middleware/advancedResults')
const Course = require('../Models/Course')

router.route('/').get(advancedResults(Course, 'bootCamp'), getCourses)
module.exports = router
