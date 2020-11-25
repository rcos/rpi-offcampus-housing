import React, {useEffect} from 'react'
import ReactDOM from 'react-dom'
import {motion, useSpring, useTransform} from 'framer-motion'

interface IPopupConfig {
  popup: any
  show: boolean
}

export const usePopup = ({ popup, show }: IPopupConfig) => {

  const showSpring = useSpring(0)
  const displayTransform = useTransform(showSpring, (x: number) => {
    if (x < 0.1) return `none`
    return `block`
  })

  const popupSpring = useSpring(0)
  const popupSlide = useTransform(popupSpring, (x: number) => {
    // return `calc(-50% + ${30 * (1-x)}px)`
    return `${(1-x) * 30}px`
  })

  const popupWrapper = (_popup_: any) => {

    return (<motion.div 
      style={{
        display: displayTransform,
        opacity: showSpring
      }}
      className="popup-wrapper">
      <motion.div className="holder" style={{
        // translateY: popupSlide
        marginTop: popupSlide,
        opacity: popupSpring
      }}>{_popup_}</motion.div>
    </motion.div>)
  }

  useEffect(() => {

    const unsubShowSpring = showSpring.onChange((x: number) => {
      if (x == 1) popupSpring.set(1)
    })

    const unsubPopupSpring = popupSpring.onChange((x: number) => {
      if (x == 0) showSpring.set(0)
    })

    return () => {
      unsubShowSpring ()
      unsubPopupSpring ()
    }
  }, [])

  useEffect(() => {
    if (show) showSpring.set(1)
    else popupSpring.set(0)

    // if (show) ReactDOM.render(popupWrapper(popup), document.getElementById('popup-container'))
    // else ReactDOM.render(<div></div>, document.getElementById('popup-container'))

    ReactDOM.render(popupWrapper(popup), document.getElementById('popup-container'))
  }, [popup, show])
}