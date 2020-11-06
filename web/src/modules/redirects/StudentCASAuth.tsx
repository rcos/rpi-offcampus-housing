import React, { useEffect } from 'react'

const handleLogin = (): boolean => {
  
  console.log(`Handle Loggin`)

  return true

}

// export default () => {
//   const redirect = useRedirect({
//     onSuccess: "/landlord/login",
//     onError: "/landlord/register",
//     process: handleLogin
//   })

//   return (<div></div>)
// }


// temp
export default () => {

  useEffect(() => {
    handleLogin()
  })

  return (<div>Auth</div>)
}