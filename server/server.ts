import express from 'express'
const app = express()

// load environment variablesd
const result = require('dotenv').config({
  'path': `../.env.${process.env.NODE_ENV}`
})

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
})