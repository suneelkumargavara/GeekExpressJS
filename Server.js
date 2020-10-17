const express = require('express')
const dotEnv = require('dotenv')
const morgon = require('morgan')
const fileUpload = require('express-fileupload')
const path = require('path')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')

const connectDB = require('./Config/db')
const errorHandler = require('./middleware/error')

require('colors')
//Load Environment Files
dotEnv.config({ path: './Config/config.env' })

//Routes
const bootcamps = require('./Routes/bootcamps')
const courses = require('./Routes/courses')
const auth = require('./Routes/auth')
const users = require('./Routes/users')
const reviews = require('./Routes/review')

//Connect to MongoDB
connectDB()

const app = express()

//Add Parser
app.use(express.json())

// Cookie parser
app.use(cookieParser())

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 100
})
app.use(limiter)

//Prevent http param polution
app.use(hpp())

// Cross origin resourse sharing
app.use(cors())

//Dev Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgon('dev'))
}

//Add FileUploading
app.use(fileUpload())

//Sanitize data
app.use(mongoSanitize())

// Set security headers
app.use(helmet())

// Prevent Xss attacks
app.use(xss())

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//Add Routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/reviews', reviews)
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
