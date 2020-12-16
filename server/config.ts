
const frontendPath = (path: string | null = null) => {

  if (process.env.NODE_ENV == 'development') {
    return `http://localhost:${process.env.PORT}${path == "" || path == undefined || path == null? '' : `/${path}`}`
  }
  else if (process.env.NODE_ENV == 'production') {
    return `http://PLACEHOLDER`
  }

  // invalid environment
  return 'ERR'
}

const backendPath = (path: string | null = null): string => {

  if (process.env.NODE_ENV == 'development') {
    return `http://localhost:${process.env.SERVER_PORT}${path == "" || path == undefined || path == null ? '' : `/${path}`}`
  }
  else if (process.env.NODE_ENV == 'production') {
    return `http://PLACEHOLDER`
  }

  // invalid environment
  return 'ERR'
}

export { frontendPath, backendPath }