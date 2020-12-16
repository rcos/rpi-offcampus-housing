import React, {useEffect, useRef, useState} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'
import {BsThreeDotsVertical} from "react-icons/bs"

interface IContextMenu {
  children: any
  menuItems: IMenuItem[]
  iconLocation?: 'left' | 'right'
  position: 'top right' | 'top left' | 'bottom right' | 'bottom left'
}

interface IMenuItem {
  label: string
  icon?: any
  onClick?: Function
}

const ContextMenu = ({children, menuItems, iconLocation, position}: IContextMenu) => {

  const menuRef = useRef<HTMLDivElement>(null)
  const makeList = (): JSX.Element[] => {

    let iconLeft: boolean = !iconLocation || iconLocation == 'left'

    return menuItems.map((item: IMenuItem, index: number) => (<motion.div 
      style={{opacity: opacityTransform}} 
      key={index} 
      className={`context-menu-item ${iconLeft? 'icon-left' : 'icon-right'}`}
      onClick={() => {
        if (item.onClick) item.onClick()
        setShowCtxMenu(false)
      }}>

      {/* icon left */}
      {iconLeft && <div className="icon-area">{item.icon}</div>}

      <div className={`text-area ${iconLeft ? 'left' : 'right'}`}>{item.label}</div>
      
      {/* icon right */}
      {!iconLeft && <div className="icon-area">{item.icon}</div>}

    </motion.div>))
  }

  const [showCtxMenu, setShowCtxMenu] = useState<boolean>(false)
  const showSpring = useSpring(0, {duration: 300})
  const opacityTransform = useTransform(showSpring, [0, 1], [0, 1])

  const minimizeSpring = useSpring(0, {duration: 100})
  const scaleSpring = useTransform(minimizeSpring, [0, 1], [0, 1])

  useEffect(() => {
    if (showCtxMenu) minimizeSpring.set(1)
    else showSpring.set(0)
  }, [showCtxMenu])

  // mount
  useEffect(() => {

    let unsubShowSpring = showSpring.onChange((val: number) => {

      // start the minimize spring
      if (val == 0) {
        minimizeSpring.set(0)
      }
    })

    let unsubMinimizeSpring = minimizeSpring.onChange((val: number) => {

      if (val == 1) {
        showSpring.set(1)
      }

    })

    return () => {
      unsubShowSpring()
      unsubMinimizeSpring()
    }
  }, [])

  useEffect(() => {

    const handleClickClose = (e: MouseEvent) => {
      if (menuRef.current) {
        if (!menuRef.current.contains(e.target as any)) setShowCtxMenu(false)
      }
    }

    window.addEventListener(`click`, handleClickClose)

    return () => {
      
      window.removeEventListener(`click`, handleClickClose)
    }
  }, [menuRef])

  const toggleCtxMenu = () => setShowCtxMenu(!showCtxMenu)

  const isTop = (): boolean => position.includes('top')
  const isBottom = (): boolean => position.includes('bottom')

  const isLeft = (): boolean => position.includes('left')
  const isRight = (): boolean => position.includes('right')

  return (<div className="context-menu-container" ref={menuRef}>
    <div onClick={toggleCtxMenu}>{children}</div>

    {/* Context Menu */}
    <motion.div className="context-menu" style={{
      scale: scaleSpring,
      transformOrigin: position,
      top: isTop() ? `calc(100% + 10px)` : '',
      bottom: isBottom() ? `calc(100% + 10px)` : '',
      right: isRight() ? '0' : '',
      left: isLeft() ? '0' : ''
    }}>
      {makeList()}
    </motion.div>
  </div>)
}

export const TripleDotButton = <div className="icon-button" style={{position: 'relative'}}><BsThreeDotsVertical /></div>

export default ContextMenu