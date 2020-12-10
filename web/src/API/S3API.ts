import {backendPath} from '../config'
// @ts-ignore
import urlencode from 'urlencode'
import API from './API'

interface ImageSizeProps {
  width: number
  height: number
}
export const objectURI = (s3_key: string, size: ImageSizeProps | undefined = undefined): string => 
  backendPath(`/vendors/aws_s3/get-object/${urlencode(s3_key)}${ size == undefined ? '' : `?width=${size.width}&height=${size.height}` }`)

interface IUploadObjectsConfig {
  restricted: boolean
  files: Blob[]
  students_access?: string[]
  landlords_access?: string[]
  elevated_privileges_access?: string[]
  max_image_width?: number
  max_image_height?: number
}
export const uploadObjects = async (config: IUploadObjectsConfig): Promise<any> => {
  let form_data: FormData = new FormData();

  // add the files ...
  if (config.files.length == 0) {
    console.error(`Nothing to upload.`)
    return null;
  }
  config.files.forEach((file_: Blob) => {
    form_data.append('objects', file_)
  })

  form_data.append('restricted', `${config.restricted}`)
  if (config.restricted) {
    if (!config.students_access && !config.landlords_access && !config.elevated_privileges_access) {
      console.error(`No access provided for restricted uploaded objects.`)
      return {error: `No access provided for restricted uploaded objects.`}
    }
    // add student access
    let i = 0;
    for (let k = 0;config.students_access && k < config.students_access.length; ++k) {
      form_data.append(`r_${i}`, `student|${config.students_access[k]}`)
      ++i;
    }

    // add landlord access
    for (let k = 0;config.landlords_access && k < config.landlords_access.length; ++k) {
      form_data.append(`r_${i}`, `landlord|${config.landlords_access[k]}`)
      ++i;
    }

    // add elevated privileges access
    for (let k = 0; config.elevated_privileges_access && k < config.elevated_privileges_access.length; ++k) {
       form_data.append(`r_${i}`, `elevated|${config.elevated_privileges_access[k]}`)
    }

    // at least 1 person must be given access to this resource
    if (i == 0) {
      console.error(`No access provided for restricted uploaded objects.`)
      return {error: `No access provided for restricted uploaded objects.`}
    }
  }

  // add size restriction params
  if (config.max_image_width) form_data.append('max_image_width', `${config.max_image_width}`)
  if (config.max_image_height) form_data.append('max_image_height', `${config.max_image_height}`)

  // send
  return API.post(backendPath('/vendors/aws_s3/upload'), form_data, {
    headers: {
      'content-type': 'multipart/form-data'
    }
  })
}