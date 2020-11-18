import {backendPath} from '../config'
// @ts-ignore
import urlencode from 'urlencode'

export const imageURI = (s3_key: string): string => backendPath(`/vendors/aws_s3/get-object/${urlencode(s3_key)}`)