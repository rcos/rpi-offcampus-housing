import express, { application } from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
const app = express()


// load environment variablesd
dotenv.config({'path': `../.env`})
if (!process.env.NODE_ENV) {
  console.error(`NODE_ENV is not set.\n`);
  process.exit();
}
dotenv.config({'path': `../.env.${process.env.NODE_ENV!.replace(' ', '')}`})

const PORT = process.env.SERVER_PORT
const MONGO_URI = `mongodb+srv://rpioffcampusprojectteam:${process.env.MONGO_DB_PASSWORD}@cluster0.vsneo.mongodb.net/housing-database?retryWrites=true&w=majority`

// connect to MongoDB via mongoose
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useFindAndModify: true,
  useCreateIndex: true
}, 

// mongoose connection callback
(err: any) => {
  if (err) {
    console.error(`❌ Error connecting to mongoose.`);
    process.exit(1);
  }
  else console.log(`✔ Successfully connect to MongoDB instance.`);
});

// TODO, API CI -> https://www.freecodecamp.org/news/how-to-automate-rest-api-end-to-end-tests/

// setup middleware
import bodyParser from 'body-parser'
app.use(express.json())

// API routes
import test from './API/test'
import StudentGET from './API/Student/student.get'
import StudentPUT from './API/Student/student.put'
import LandlordGET from './API/Landlord/landlord.get'
import LandlordPUT from './API/Landlord/landlord.put'
import ReviewGET from './API/Review/review.get'
import ReviewPUT from './API/Review/review.put'
app.use(test);

app.use('/api/students', StudentGET)
app.use('/api/students', StudentPUT)
app.use('/api/landlords', LandlordGET)
app.use('/api/landlords', LandlordPUT)
app.use('/api/reviews', ReviewGET)
app.use('/api/reviews', ReviewPUT)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});