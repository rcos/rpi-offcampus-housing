import React, {useEffect, useState} from 'react'
import {motion, useTransform, useSpring} from 'framer-motion'

interface AlertControllerInterface {
  alertInfo: any
}

const AlertController = ({alertInfo}: AlertControllerInterface) => {

  const alertSpring = useSpring(0, {
    damping: 30
  })
  const alertTranslate = useTransform(alertSpring, [0, 1], [-100, 10])
  const [alertMessage, setAlertMessage] = useState<string>("")
  const [alertType, setAlertType] = useState<string>("none")

  useEffect(() => {
    console.log(`CTX VALUE:`)
    console.log(alertInfo)

    setAlertMessage(alertInfo.value)
    setAlertType(alertInfo.type)

    if (alertInfo.id !== 0) {
      alertSpring.set(1)
      setTimeout(() => {
        alertSpring.set(0)
      }, 2000)
    }

  }, [alertInfo, alertSpring])

  return (<motion.div 
    style={{
      translateY: alertTranslate,
      translateX: `-50%`
    }}
    className={`alert-controller ${alertType}`}>{alertMessage}</motion.div>)
}

export default AlertController