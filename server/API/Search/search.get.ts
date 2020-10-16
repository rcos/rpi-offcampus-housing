import express from 'express'
import chalk from 'chalk'
import Property, {IPropertyDoc} from '../../schemas/property.schema'

const searchRouter = express.Router();

searchRouter.get('/properties/:offset/:limit', (req, res) => {

  let offset = parseInt(req.params.offset)
  let limit = parseInt(req.params.limit)

  console.log(chalk.bgBlue(`👉 GET /api/search/properties/:offset/:limit/`))
  console.log(chalk.blue(`\toffset: ${offset}`))
  console.log(chalk.blue(`\tlimit: ${limit}`))

  // TODO get search properties from body 
  // (min/max price, available rooms, max distance from campus, lease period)

  Property.find({
    // TODO add filtering ...
  })
  .skip(offset)
  .limit(limit)
  .exec((err, properties_docs) => {
    if (err) {
      console.log(chalk.bgRed(`❌ Error searching for properties.`))
      console.log(err)

      res.json({
        success: false,
        error: `Query error`
      })
    }
    else {

      // Must run second query to find the count of possible results
      Property.find({}).count().exec((err, doc_count) => {

        if (err) {
          console.log(chalk.bgRed(`❌ Error trying to get count of search results.`))
          res.json({
            success: false,
            error: `Internal server error`
          })
        }
        else {
          console.log(chalk.bgGreen(`✔ Successfully found ${properties_docs ? properties_docs.length : 0} property documents!`))
          res.json({
            success: true,
            count: doc_count,
            properties: properties_docs ? properties_docs.map(prop_ => prop_.toObject()) : []
          })
        }
      })
    }
  })

})

export default searchRouter