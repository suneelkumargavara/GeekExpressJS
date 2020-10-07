const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotEnv = require('dotenv')

//load environment variables
dotEnv.config({ path: './config/config.env' })

//load models
const Bootcamp = require('./Models/Bootcamp')
const Course = require('./Models/Course')

//connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})

//Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
)
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
)

console.log('courses are', courses)

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps)
    await Course.create(courses)
    console.log('Data imported'.green.inverse)
    process.exit()
  } catch (err) {
    console.log(err)
  }
}

//Delete Data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany()
    await Course.deleteMany()
    console.log(`Data Destroyed...`.red.inverse)
    process.exit()
  } catch (err) {
    console.log(err)
  }
}

if (process.argv[2] === '-i') {
  importData()
} else if (process.argv[2] === '-d') {
  deleteData()
}
