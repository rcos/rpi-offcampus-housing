import express from 'express'

const test = express.Router();

test.get('/test', (req, res) => {
  console.log(`Request from /test`)
  res.json({
    success: true,
    message: 'This is a test API call.'
  })
})

export default test