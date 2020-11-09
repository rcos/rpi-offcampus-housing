/*
Application configuration,
including environmen variable setup.
*/

const config = () => {
  
  const dotenv = require('dotenv')
  // Load environmental variables
  dotenv.config({ path: `../../.env` });
  if (!process.env.REACT_APP_ENV) {
    console.error(`NODE_ENV is not set.\n`);
    // process.exit(0);  
  }

  if (process.env.REACT_APP_ENV) {
    dotenv.config({ path: `../../.env.${process.env.REACT_APP_ENV.replace(" ", "")}` });
  }
}

const getFrontendBaseUrl = () => {

  if (process.env.REACT_APP_ENV == 'development') {
    
  }
  if (process.env.REACT_APP_ENV == 'production') {
    // TODO place base production url here
    return 'http://PLACEHOLDER'
  }

  return 'ERR'
}

const getBackendBaseUrl = () => {

  if (process.env.REACT_APP_ENV == 'development') {
    return `http://localhost:${process.env.REACT_APP_SERVER_PORT}`
  }
  if (process.env.REACT_APP_ENV == 'production') {
    // TODO place base production url here
    return 'http://PLACEHOLDER'
  }
  return 'ERR'
}

const backendPath = (path) => {
  return `${getBackendBaseUrl()}${path}`
}

export { config, backendPath}