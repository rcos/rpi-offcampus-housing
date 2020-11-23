import React from 'react'

interface ButtonInterface {
  text?: string
  icon?: any
  iconLocation?: "left" | "right"
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

  const getIconLocation = (): "left" | "right" | "" => {

    if (!icon) return ""
    return iconLocation && ["left", "right"].includes(iconLocation! as string) ? 
    iconLocation : "left"
  }

  return (<div className={`app-button ${getIconLocation()}-icon`}
    onClick={() => {
      if (onClick) onClick ()
    }}
    style={{
      backgroundColor: bgColor(),
      color: textColor ? textColor : `black`,
      width: `${width ?? width}px`
    }}
  >
    {
      getIconLocation() == "left" &&
      <div className={`icon-area ${getIconLocation()}`}>
        {icon}
      </div>
    }
    <div className={`text-area`}>{text}</div>
    {
      getIconLocation() == "right" &&
      <div className={`icon-area ${getIconLocation()}`}>
        {icon}
      </div>
    }
  </div>)
}

export default Button