const express = require('express')
const morgan = require('morgan')
const dotenv = require('dotenv')
const rateLimit = require("express-rate-limit");
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const errorMiddleware = require("./middleware/errorMiddleware");
const { errorHandler, notFound } = errorMiddleware;
const app = express()

dotenv.config()
// middlewares

// Set security HTTP headers
app.use(helmet())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
  });
  app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against
app.use(xss())


// app.get('/', (req, res) => {
//     res.status(200).json({
//         message: 'hello from server ',
//         app: 'Nottours'
//     })
// })

// app.post('/', (req, res) => {
//     res.send("you can post ")
// })

app.post('/' , (req,res) => {
  const data = req.body
  console.log(data)
  res.status(201).json({
      data
  })
})

//  Routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.use(notFound)
app.use(errorHandler)
module.exports = app