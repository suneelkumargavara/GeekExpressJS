const express = require('express')
const dotEnv = require('dotenv')
const morgon = require('morgan')

const connectDB = require('./Config/db')
const errorHandler = require('./middleware/error')

require('colors')
//Load Environment Files
dotEnv.config({ path: './Config/config.env' })

//Routes
const bootcamps = require('./Routes/bootcamps')
const courses = require('./Routes/courses')

//Connect to MongoDB
connectDB()

const app = express()

//Add Parser
app.use(express.json())

//Dev Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgon('dev'))
}

//Add Routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(
  PORT,
  console.log(
    `Server running on ${process.env.NODE_ENV} environment and ${PORT} port`
  )
)

//Handle unhandled rejections
process.on('unhandledRejection', (error, promise) => {
  console.log(`Error is ${error.name}`.red)
  server.close(() => process.exit())
})
