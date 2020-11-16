
/**
 * aws_s3.ts
 * This module takes care of file uploads to our Amazon S3 bucket
 */

import aws from 'aws-sdk';
import express from 'express';
import mutler from 'multer'
import chalk from 'chalk'
import _ from 'lodash'
const upload = mutler()

let user_creds = new aws.Credentials({
  accessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_IAM_SECRET as string
})

aws.config.update({ region: process.env.AWS_BUCKET1_REGION as string, credentials: user_creds })
const aws_s3 = new aws.S3({ apiVersion: "2006-03-01" });
const awsRouter = express.Router()

const randKey = ({length}: {length: number}): string => {
  let key_ = '';
  if (length <= 0) return key_;
  for (let i = 0; i < length; ++i) {
    key_ += Math.floor(Math.random()*10)
  }
  return key_;
}

/**
 * /upload
 * File upload endpoint. Can handle up to 10 files at a time.
 * 
 * To upload a file, send a post request of type multipart form-data and set the key
 * for each file to be uploaded as 'objects'.
 */
awsRouter.post('/upload', upload.array('objects', 10), (req: express.Request, res: express.Response) => {

  console.log(chalk.bgBlue(`👉 AWS S3 File Upload`))
  if (_.has(req.body, 'description')) console.log(`${chalk.cyan(`@desc`)} ${req.body.description}`)
  let files = req.files

  if (!files) {
    console.log(chalk.bgRed(`❌ Error: No files to upload`))
    res.json({ success: false, error: "No files to upload." })
  }
  if (typeof files != typeof []) {
    console.log(chalk.bgRed(`❌ Error: Files is not an array (mutler)`))
    res.json({ success: false, error: "Internal server error."})
  }

  console.log(chalk.yellow(`Uploading ${files.length} files`))
  let Key;
  let upload_promises = (files as []).map((file_: any, index: number) => {
    return new Promise((resolve, reject) => {

      // create the key
      let split_ = file_.originalname.split('.');
      Key = split_ = split_.slice(0, split_.length - 1).join('-')
      if (split_.length == 1) Key = split_[0]
      else if (split_.length == 0) Key = 'ambiguous'

      // TODO add file type
      Key += `-#-${randKey({length: 10})}`
      Key += `.${file_.mimetype.replace('/', '_')}`

      let uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET1 as string,
        Key: Key,
        Body: file_.buffer
      }
      
      aws_s3.upload(uploadParams, (err: any, data: aws.S3.ManagedUpload.SendData): void => {
        if (err) reject({errorMessage: 'Error uploading to aws_s3', s3_err: err})
        else resolve(data)
      })

    })
  })
  
  Promise.all(upload_promises).then((responses) => {
    console.log(chalk.bgGreen(`✔ Successfully uploaded ${responses.length} images to AWS.`))
    res.json({success: true, files_uploaded: responses})
  })
  .catch(err => {
    console.log(chalk.bgRed(`❌ Error: An error occurred while uploading to AWS`))
    console.log(chalk.red(err))
    res.json({success: false, error: err})
  })
})

export { awsRouter }