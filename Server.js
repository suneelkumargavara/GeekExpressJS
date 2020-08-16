const express = require("express");
const dotEnv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./Config/db");
const errorHandler = require("./middleware/error");

require("colors");

//Load Env Files
dotEnv.config({ path: "./Config/config.env" });

//Routes
const bootcamps = require("./Routes/bootcamps");
const courses = require("./Routes/courses");

//Connect Mongo DB
connectDB();

const app = express();

//Add parser
app.use(express.json());

//Dev Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Add Routers
app.use("/api/v1/bootcamps", bootcamps);

app.use("/api/v1/courses", courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
  )
);

//Handle unhandled Rejections
process.on("unhandledRejection", (error, promise) => {
  console.log(`Error is ${error.name}`.red);
  //Close server and exit
  server.close(() => process.exit());
});
