
/**
 * aws_s3.ts
 * This module takes care of file uploads to our Amazon S3 bucket
 */

import aws from 'aws-sdk';
import express from 'express';
import mutler from 'multer'
import chalk from 'chalk'
import _ from 'lodash'
import sizeOf from 'buffer-image-size'
// @ts-ignore
import _resizeImage_ from 'resize-image-buffer'
import mongoose from 'mongoose'
const util = require('util')
let ObjectId = mongoose.Types.ObjectId
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
 * 
 * Metadata: Metadata can be added to objects to describe the type of objects being uploaded.
 *  max_image_width => This should be a string representation of a number. If this value is set, all files that images will
 *                      be resized to have this max width, maintaining aspect ratio
 *  max_image_height => Just like max_image_width, this will resize all files that are images to not exceed this value in height,
 *                      maintaining aspect ratio. If both max width and height are set, the dimensions that give the higher resolution
 *                      will be used.
 *  restricted: "true" | "false" => If restricted is true, the uploaded documents will only be acessable to those
 *              defined in the "r_n" fields, where n is a number.
 *              e.g
 *                restricted = "true",
 *                r_1 = "landlord|aio123kj3jl13jk1jl3j" 
 *                r_2 = "student|afeopqwoepqoepoqpweq"
 *                
 *                This example means the uploaded files will only be accessable to the landlord with id "aio123kj3jl13jk1jl3j"
 *                and the student with id "afeopqwoepqoepoqpweq"
 */
awsRouter.post('/upload', upload.array('objects', 10), (req: express.Request, res: express.Response) => {

  console.log(chalk.bgBlue(`👉 AWS S3 File Upload`))
  console.log(util.inspect(req.headers, {showHidden: false, depth: null}))

  if (_.has(req.body, 'description')) console.log(`${chalk.cyan(`@desc`)} ${req.body.description}`)
  let files = req.files

  let max_image_width = -1, max_image_height = -1;
  let restricted = false;
  let restricted_to: { type: 'student' | 'landlord', id: string }[] = [];

  if (_.has(req.body, 'max_image_width')) max_image_width = parseInt(req.body.max_image_width);
  if (_.has(req.body, 'max_image_height')) max_image_height = parseInt(req.body.max_image_height);
  if (_.has(req.body, 'restricted')) {
    if (req.body.restricted.toLowerCase() == "true") restricted = true;
    console.log(`\t${chalk.cyan(`restricted?`)}: ${restricted}`)
    if (restricted) {
      let i = 0;

      console.log(`\tRestricted to:`)
      while (req.body[`r_${i}`]) {
        let allowed_user = req.body[`r_${i}`].split('|')
        if (allowed_user.length != 2 || 
            (allowed_user[0] != "student" && 
            allowed_user[0] != "landlord") || 
            !ObjectId.isValid(allowed_user[1])) 
            {
              ++i;
              continue;
            }

            let user_type: "student" | "landlord" = allowed_user[0]
            let user_id: string = allowed_user[1]
            console.log(`\t\t${user_type} (${chalk.cyan(user_id)})`);
            restricted_to.push({
              type: user_type,
              id: user_id
            })
        ++i;
      }
    }
  }

  if (!files) {
    console.log(chalk.bgRed(`❌ Error: No files to upload`))
    res.json({ success: false, error: "No files to upload." })
  }
  if (typeof files != typeof []) {
    console.log(chalk.bgRed(`❌ Error: Files is not an array (mutler)`))
    res.json({ success: false, error: "Internal server error."})
  }

  const withinSizeConstraints = (imageInfo: {width: number, height: number, type: string}): boolean => {
    if (max_image_width != -1 && imageInfo.width > max_image_width) return false; 
    if (max_image_height != -1 && imageInfo.height > max_image_height) return false;
    return true;
  }

  const resizeImage = async (img_buffer: Buffer, imageInfo: {width: number, height: number, type: string}): Promise<Buffer> => {
    let width_scale: number = max_image_width / imageInfo.width
    let height_scale: number = max_image_height / imageInfo.height

    let w_dim = {height: imageInfo.height * width_scale, width: imageInfo.width * width_scale}
    let h_dim = {height: imageInfo.height * height_scale, width: imageInfo.width * height_scale}
    let new_dim;
    if (w_dim.height * w_dim.width > h_dim.height * h_dim.width) new_dim = w_dim;
    else new_dim = h_dim

    console.log(chalk.blue(`\tNew image Dimensions: width => ${new_dim.width}, height => ${new_dim.height}`))
    return _resizeImage_(img_buffer, { width: new_dim.width, height: new_dim.height })
  }

  console.log(chalk.yellow(`Uploading ${files.length} files`))
  let Key;
  let upload_promises = (files as []).map((file_: any, index: number) => {
    return new Promise(async (resolve, reject) => {

      // create the key
      let split_ = file_.originalname.split('.');

      // if this is an image, and there is a max_image_width or max_image_height, the image needs
      // to be resized to meet the dimensions

      try {
        let image_data = sizeOf(file_.buffer)

        if (!withinSizeConstraints(image_data)) {
          console.log(`Resizing image...`)
          file_.buffer = await resizeImage(file_.buffer, image_data)
        }
      }
      catch (err) {}

      Key = split_ = split_.slice(0, split_.length - 1).join('-')
      if (split_.length == 1) Key = split_[0]
      else if (split_.length == 0) Key = 'ambiguous'

      // TODO add file type
      Key += `-#-${randKey({length: 10})}`
      Key += `.${file_.mimetype.replace('/', '_')}`

      let uploadParams: aws.S3.PutObjectRequest = {
        Bucket: process.env.AWS_S3_BUCKET1 as string,
        Key: Key,
        Body: file_.buffer,
        Metadata: {
          restricted: `${restricted}`,
          ...(Object.fromEntries(

            restricted_to.map((restricted_user, i) => {
              return [`r_${i}`, `${restricted_user.type}|${restricted_user.id}`]
            })
          ))
        }
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

awsRouter.get('/get-object/:object_key', (req, res) => {

  console.log(chalk.bgGreen(`👉 AWS S3 Get Object`))
  console.log(`key: ${req.params.object_key}`)
  if (!_.has(req.params, 'object_key') || typeof req.params.object_key != typeof "") {
    console.log(chalk.bgRed(`❌ Error: Invalid object key.`))
    res.send(`Invalid Request`)
    return;
  }
  console.log(`\t${chalk.cyan(`object_key:`)} ${req.params.object_key}`)

  let split_ = req.params.object_key.split('.')
  if (split_.length < 2) {
    console.log(chalk.bgRed(`❌ Error: Key has no mimetype.`))
    res.send(`Invalid Request`)
    return;
  }
  let content_type = split_[split_.length - 1].replace('_', '/')
  console.log(`\t${chalk.cyan(`Content-Type:`)} ${content_type}`)

  aws_s3.getObject({
    Bucket: process.env.AWS_S3_BUCKET1 as string,
    Key: req.params.object_key
  }, 
  (err: aws.AWSError, data: aws.S3.GetObjectOutput) => {

    if (err) {
      console.log(chalk.bgRed(`❌ Error: Problem retrieving object from S3 bucket.`))
      console.log(err)
      res.send(`Invalid Request`)
    }
    else {

      // check if there are any restrictions

      // check if the requester has access to this information
      if (data.Metadata) {
        if (data.Metadata["restricted"] && data.Metadata["restricted"].toLowerCase() == 'true') {
          if (!req.user || !(req.user as any)._id || !(req.user as any).type) {
            console.log(chalk.bgRed(`❌ Resource is restricted and user is unauthorized`))
            res.send(`Forbidden`)
            return;
          }

          // parse the authenticated user
          let user_id = (req.user! as any)._id
          let user_type = (req.user! as any).type
          console.log(`User Type: ${user_type}`)
          console.log(`User Id: ${user_id}`)
          let access: IAccess = parseUserAccess(data.Metadata)

          console.log(`Requested by ${user_type} => ${user_id}`)
          console.log("Access", access)

          if (user_type != "student" && user_type != "landlord") {
            console.log(chalk.bgRed(`❌ Authorized user is not a student or a landlord. Cannot access resource.`))
            res.send(`Forbidden`)
            return;
          }
          if ((user_type == "student" && !access.students.includes(`${user_id}`)) ||  (user_type == "landlord" && !access.landlords.includes(`${user_id}`))) {
            console.log(chalk.bgRed(`❌ Restricted resource is not accessible by ${user_type} => ${user_id}`))
            res.send('Forbidden')
            return;
          }
        }
      }

      console.log(chalk.bgGreen(`✔ Successfully retrieved object!`))
      // console.log(data)
      
      res.writeHead(200, {
        // 'Content-Type': data.ContentType,
        'Content-Type': content_type,
        'Content-Length': (data.Body as Buffer).length
      })
      res.end(data.Body)
    }

  })

})

interface IAccess {
  students: string[]
  landlords: string[]
}
const parseUserAccess = (metadata: aws.S3.Metadata | undefined): IAccess => {
  if (!metadata) return {students: [], landlords: []}

  let result: IAccess = {students: [], landlords: []}
  let i = 0;
  while (metadata[`r_${i}`]) {
    console.log(`r_${i} = ${metadata[`r_${i}`]}`)
    let access_info: string[] = metadata[`r_${i}`].split('|')
    ++i;
    if (access_info.length != 2 || (access_info[0] != "student" && access_info[0] != "landlord") || !ObjectId.isValid(access_info[1])) {
      console.log(`skipping r_${i} = ${metadata[`r_${i}`]}`)
      continue;
    }

    if (access_info[0] == "student") result.students.push(access_info[1])
    if (access_info[0] == "landlord") result.landlords.push(access_info[1])
  }
  return result;
}

export { awsRouter }