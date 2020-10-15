import React from "react"

interface IAlertContext {
  id: number
  successAlert?: Function
}

const AlertContext = React.createContext<IAlertContext>({id: 0})

const alertContextValue = {
  successAlert: () => {
    console.log(`Success alert called!`)
  }
}

export default AlertContext
export {alertContextValue}
export type {IAlertContext}