import React, { useEffect, useRef, useState } from 'react'
import { BsDashSquareFill, BsDashSquare } from 'react-icons/bs'
import { motion, useSpring, useTransform } from 'framer-motion'

interface IMinimizable {
  title: string
  children: any
}

const Minimizable = ({
  title,
  children
}: IMinimizable) => {

  const containerRef = useRef<HTMLDivElement>(null)
  const [minimized, setMinimized] = useState<boolean>(false)

  const hideSpring = useSpring(0)
  const minimizeSpring = useSpring(0)

  const opacityTransform = useTransform(hideSpring, [0, 1], [0, 1])
  // const displayTransform = useTransform(minimizeSpring, (x) => {
  //   if (x === 0) return 'none'
  //   else return 'block'
  // })
  const offsetTransform = useTransform(minimizeSpring, (x) => {

    if (containerRef.current == null) return 0;

    let height_: number = (containerRef.current! as any).offsetHeight
    return -1  * (1-x) * height_
  })

  useEffect(() => {

    const unsubHide = hideSpring.onChange((val: number) => {
      if (val == 0) {
        minimizeSpring.set(0)
      }
    })
    const unsubMinimize = minimizeSpring.onChange((val: number) => {
      if (val == 1) {
        hideSpring.set(1)
      }
    })

    return () => {

      // unsubscribe the updater
      unsubHide();
      // unsubMinimize();
    }
  }, [])

  useEffect(() => {
    if (minimized) hideSpring.set(0)
    else minimizeSpring.set(1)
  }, [minimized, hideSpring])

  return (<div className="minimizable">

    <div className="content-title" onClick={() => { setMinimized(!minimized) }} 
      style={{
        position: 'relative',
        zIndex: 2
      }}>
      <div className="icon-area">
        {minimized && <BsDashSquare />}
        {!minimized && <BsDashSquareFill />}
      </div>
      <div className="title-text">{title}</div>
    </div>

    <motion.div
      ref={containerRef}
      style={{
        zIndex: 1,
        opacity: opacityTransform,
        // display: displayTransform
        marginTop: offsetTransform
      }}
      className="content-area">
      {children}
    </motion.div>

  </div>)
}

export default Minimizable