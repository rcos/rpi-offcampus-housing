import React, {useEffect, useRef} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'

interface ICommentBubble {
  message: string
  header: string
  action?: string
  onActionClick?: Function
  color?: string
  show?: boolean
}

const CommentBubble = ({
  message, header, action, onActionClick, color, show
}: ICommentBubble) => {

  const containerRef = useRef<HTMLDivElement>(null)
  
  const appearSpring = useSpring(0, {stiffness: 90})
  const heightTransform = useTransform(appearSpring, x => {
    if (containerRef.current == null) return 0;

    let height_: number = (containerRef.current! as any).offsetHeight
    return -1  * (1 - x) * height_
  })

  useEffect(() => {
    // let height_: number = (containerRef.current! as any).offsetHeight

    const updateShow = () => {
      if (show == null) {
        appearSpring.set(1)
      }
      else {
        if (show) appearSpring.set(1)
        else appearSpring.set(0)
      }
    }

    updateShow()
  }, [containerRef, appearSpring, show])

  useEffect(() => {
    appearSpring.set(1)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (show != null) {
      if (show) appearSpring.set(1)
      else appearSpring.set(0)
    }
  }, [show, appearSpring])

  const getColor = (): string => {
    if (color) return color
    // default
    return 'blue'
  }

  return (<div ref={containerRef}>
    <motion.div 
    style={{
      opacity: appearSpring,
      marginTop: heightTransform
    }}
    className={`comment-bubble ${getColor()}`}>
    <div
    style={{
      fontWeight: 600,
      textTransform: 'uppercase',
      fontSize: '0.65rem',
      marginBottom: '5px',
      letterSpacing: '1px'
    }}
    >{header}</div>

    <div 
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
      fontSize: '0.9rem'
    }}>
      {message == "" ? <div style={{color: 'rgba(0, 0, 0, 0)'}}>x</div> : <div
        style={{fontFamily: 'mukta', lineHeight: '15px'}}
      >{message}</div>}
      {
        action &&
        <div 
        className="action-button"
        onClick={() => {
          if (onActionClick) onActionClick()
        }}>{action}</div>
      }
    </div>
  </motion.div>
  </div>)
}

export default CommentBubble