import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
const app = express()

// load environment variablesd
dotenv.config({'path': `../.env`})
dotenv.config({'path': `../.env.${process.env.NODE_ENV}`})

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});