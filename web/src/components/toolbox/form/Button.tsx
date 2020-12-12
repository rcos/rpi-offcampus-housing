import React, {useRef} from 'react'
import {Link} from 'react-router-dom'

interface ButtonInterface {
  text?: string
  icon?: any
  iconLocation?: "left" | "right"
  border?: string
  textColor?: string
  background?: string
  link_to?: string
  width?: number
  onClick?: Function
}

const Button = ({ text, icon, width, border, link_to, iconLocation, onClick, textColor, background }: ButtonInterface) => {

  const buttonRef = useRef<HTMLDivElement>(null)
  const bgColor = (): string => {
    // default black
    return background ? background : "#1E2019"
  }

  const getIconLocation = (): "left" | "right" | "" => {

    if (!icon) return ""
    return iconLocation && ["left", "right"].includes(iconLocation! as string) ? 
    iconLocation : "left"
  }

  const initTransforms = () => {
    window.addEventListener(`mouseout`, endTransforms)
    window.addEventListener(`mousemove`, handleTransform)
  }

  const handleTransform = (e: MouseEvent) => {
    if (!buttonRef.current) return;
    let bounds_: DOMRect = buttonRef.current.getBoundingClientRect();

    let r_x = 2 * (((e.x - bounds_.left) / (bounds_.right - bounds_.left)) - 0.5);
    let r_y = 2 * (((e.y - bounds_.top) / (bounds_.bottom - bounds_.top)) - 0.5);
    buttonRef.current.style.transform 
    = `perspective(6.5cm) rotateX(${(bounds_.height * 0.03) * r_y}deg) rotateY(${(bounds_.width * 0.03) * -1 * r_x}deg)`;
    buttonRef.current.style.boxShadow = `${r_x * 5}px ${r_y * 5}px 10px rgba(59, 67, 83, 0.1)`;
  }

  const endTransforms = () => {
    
    if (buttonRef.current) {
      buttonRef.current.style.transform = `perspective(6.5cm) rotateX(0deg) rotateY(0deg)`;
      buttonRef.current.style.boxShadow = `0px 0px 3.5px rgba(0, 0, 0, 0)`;
    }
    window.removeEventListener(`mousemove`, handleTransform)
    window.removeEventListener(`mouseout`, endTransforms)
  }

  return (<React.Fragment>

  {link_to ? <Link to={link_to}><div 
    ref={buttonRef}
    className={`app-button ${getIconLocation()}-icon`}
    onMouseOver={initTransforms}
    onClick={() => {
      if (onClick) onClick ()
    }}
    style={{
      backgroundColor: bgColor(),
      color: textColor ? textColor : `black`,
      width: `${width ?? width}px`
    }}
  >
    <div className="button-holder">{
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
    }</div>
  </div></Link>
  : <div 
    ref={buttonRef}
    className={`app-button ${getIconLocation()}-icon`}
    onMouseOver={initTransforms}
    onClick={() => {
      if (onClick) onClick ()
    }}
    style={{
      backgroundColor: bgColor(),
      color: textColor ? textColor : `black`,
      width: `${width ?? width}px`
    }}
  >
    <div className="button-holder">{
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
    }</div>
  </div>}
  </React.Fragment>)
}

export default Button