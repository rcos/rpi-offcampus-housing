import React from 'react'

interface ButtonInterface {
  text?: string
  icon?: any
  iconLocation?: string
  border?: string
  textColor?: string
  background?: string
  width?: number
  onClick?: Function
}

const Button = ({ text, icon, width, border, iconLocation, onClick, textColor, background }: ButtonInterface) => {

  const bgColor = (): string => {
    // default black
    return background ? background : "#1E2019"
  }

  const getIconLocation = (): string => {

    if (!icon) return ""
    return iconLocation && ["left", "right"].includes(iconLocation! as string) ? 
    iconLocation : "left"
  }

  return (<div className="app-button"
    onClick={() => {
      if (onClick) onClick ()
    }}
    style={{
      border: `2px solid ${border ? border : bgColor()}`,
      backgroundColor: bgColor(),
      color: textColor ? textColor : `black`,
      width: `${width ?? width}px`
    }}
  >
    <div className={`text-area ${getIconLocation()}`}>{text}</div>
    {
      icon &&
      <div className={`icon-area right ${getIconLocation()}`}>
        {icon}
      </div>
    }
  </div>)
}

export default Button