import React, {useEffect, useRef, useState} from 'react'
import {motion, useTransform, useSpring} from 'framer-motion'
import _ from 'lodash'
import { IoMdClose } from "react-icons/io";

import { BiChevronRight } from "react-icons/bi";
import Button from './toolbox/form/Button'

interface ICollectionAlert {
  property_data: any
}

interface AlertControllerInterface {
  alertInfo: any
}

const AlertController = ({alertInfo}: AlertControllerInterface) => {

  const dataRef = useRef<number>(-1)

  const [alertQueue, setAlertQueue] = useState<any []>([])
  const [alertQueueIndex, setAlertQueueIndex] = useState<number>(-1)
  const addToQueue = (data: any) => {
    let q_ = [...alertQueue, data];
    setAlertQueue(q_)
  }

  // showSpring -> affects how the alert controller enters/exits the view
  // 0 = alert controller is invisible
  // 1 = alert controller is fully visible
  const showSpring = useSpring(0)
  const scaleTransform = useTransform(showSpring, [0, 1], [0, 1], {clamp: false})
  const opacityTransform = useTransform(showSpring, [0, 1], [0, 1], {clamp: false})

  // timerSpring -> controlls what percentage the timer is at
  // 0 = timer starting
  // 1 = timer ended
  const timerSpring = useSpring(0, {duration: 3000})
  const widthTransform = useTransform(timerSpring, (x: number) => `${100 * x}%`)

  const goToNextAlert = () => {
    setAlertQueueIndex(dataRef.current + 1)
    dataRef.current += 1
  }

  // useEffect start
  useEffect(() => {

    const unsubShowSpring = showSpring.onChange((val: number) => {
      
      // start the timer once the alert is shown
      if (val == 1) {
        timerSpring.set(1)
      }
    })
    const unsubTimerSpring = timerSpring.onChange((val: number) => {

      // whenever the timer reaches 1:
      //  1. set it to 0
      //  2. go to the next element in the queue
      if (val == 1) {
        timerSpring.set(0)

        goToNextAlert ()
      }
      else if (val == 0 && dataRef.current != -1) {
        timerSpring.set(1)
      }

    })

    // unmount ...
    return () => {
      unsubShowSpring ()
      unsubTimerSpring ()
    }
  }, [])

  useEffect(() => {

    // console.log(`Alert Index: ${alertQueueIndex} [arr size = ${alertQueue.length}]`)
    // once we have went through all the alerts, close the alert
    if (alertQueueIndex >= alertQueue.length) {
      showSpring.set(0)
      setAlertQueueIndex(-1)
      dataRef.current = -1
    }

  }, [alertQueueIndex])

  useEffect(() => {

    // we don't want to overflow the alert queue (user probably spamming the feature)
    if (alertInfo.id != 0 && alertQueue.length < 30) {
      addToQueue(alertInfo)
    }

  }, [alertInfo])

  useEffect(() => {

    // console.log(`Alert Queue Updated (${alertQueue.length}):`)
    // console.log(alertQueue)
    if (alertQueue.length > 0 && showSpring.get() == 0) {
      showSpring.set(1)
      setAlertQueueIndex(0)
      dataRef.current = 0
    }

  }, [alertQueue])
  // end useEffect

  const getAlertHeader = (): JSX.Element => {

    return (<div className="alert-header">
      <div className="alert-queue-counter">{ alertQueueIndex + 1 }/{ alertQueue.length }</div>
      <div className="close" onClick={() => closeQueue()}><IoMdClose /></div>
      </div>)
  }

  const getAlertContents = (data_: any): JSX.Element[] => {
    let contents: JSX.Element[] = []

    console.log(`Alert Data:`)
    console.log(data_)

    if (data_ == null) return contents
    if (alertQueueIndex >= data_.length || alertQueueIndex < 0) return contents
    let data = data_.data

    if (_.has(data, 'type')) {
      if (data.type == 'collection-add') {
        contents.push(<div key={0} style={{marginBottom: '10px'}}>Successfully added <span style={{fontWeight: 600}}>{data.location}</span> to your collection!</div>)
        contents.push(<div  key={1} style={{display: 'flex', justifyContent: 'flex-end'}}>
          <div className="action-button">
            <Button 
              text="Go to Collection"
              background="white"
              iconLocation="right"
              icon={<BiChevronRight />}
            />
          </div>
        </div>)
      }
    }

    return contents
  }

  // clear all elements in the queue and close it
  const closeQueue = () => {
    setAlertQueueIndex(-1)
    setAlertQueue([])
    showSpring.set(0)
    timerSpring.set(0)
  }

  return (<motion.div 
    style={{
      scale: scaleTransform,
      opacity: opacityTransform
    }}
    className={`alert-controller success`}>
      <div>
        {getAlertHeader()}
        <div className="contents">
          {getAlertContents( alertQueueIndex == -1 ? null : alertQueue[alertQueueIndex] )}
        </div>
        
        {/* Timer */}
        <div className="alert-timer">
          <motion.div className="filler" style={{width: widthTransform}}></motion.div>
        </div>
      </div>
    </motion.div>)
}

export default AlertController