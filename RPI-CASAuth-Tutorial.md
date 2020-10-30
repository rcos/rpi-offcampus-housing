# RPI CAS Authentication Tutorial/Setup for New Web Projects

This tutorial will help you setup RPI's Central Authentication Service (CAS) for new projects.  With access to RPI's CAS, you can validate that users are current RPI students.  
This setup assumes a basic knowledge of web development and a preexisting codebase.  The project this tutorial was made for is built with Typescript, React, and Node.js.

Required NPM/Yarn Packages:

    express
    passport
    passport-cas
    express-sessions

1. Make sure to properly insall the required packages above with either NPM or Yarn.

2.  Create a button/link on your frontend that directs to the RPI CAS link, in the form: 'https://cas-auth.rpi.edu/cas/login?service= {CALLBACK_URL_ENCODED_GOES_HERE}'.  You'll need a callback URL, usually the URL of your backend server with your
dedicated CASAuth route (E.g. localhost:9010/casauth).  Make sure to URL encode it, so your finalized URL will look like: "https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A9010%2Fauth%2Fcas-auth" 

3. Make a new auth file for your backend, and properly instatiate `passport` as shown below.

![passport-setup](/img/passport_setup.png)

4. Initiate `passport` middleware in your main/server.ts file in your backend.  This can be done as shown below.

![server-passport-setup](/img/server_passport_setup.png)

5. Create your serialization and deserialization functions.

6. Callback and request handling

7. Parsing authenticated user information and session information.
