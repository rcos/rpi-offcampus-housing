import React, { useEffect, useState } from 'react'
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

  const [minimized, setMinimized] = useState<boolean>(false)
  const minimizeSpring = useSpring(0)
  const minimizeTransform = useTransform(minimizeSpring, [0, 1], [0, 1])
  const displayTransform = useTransform(minimizeSpring, (x) => {
    if (x == 0) return 'none'
    else return 'block'
  })

  useEffect(() => {
    if (minimized) minimizeSpring.set(0)
    else minimizeSpring.set(1)
  }, [minimized])

  return (<div className="minimizable">

    <div className="content-title" onClick={() => { setMinimized(!minimized) }}>
      <div className="icon-area">
        {minimized && <BsDashSquare />}
        {!minimized && <BsDashSquareFill />}
      </div>
      <div className="title-text">{title}</div>
    </div>

    <motion.div 
      style={{
        opacity: minimizeTransform,
        display: displayTransform
      }}
      className="content-area">
      {children}
    </motion.div>
  </div>)
}

export default Minimizable