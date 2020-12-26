import React, { useEffect, useRef, useState } from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'
import {HiMenuAlt2, HiX} from 'react-icons/hi'

interface MenuLinkProps {
    name: string
    onClick?: () => void
    linkTo?: string
    href?: string
    // linkTo > href > onClick
}

interface MenuSectionProps {
    label: string
    links: MenuLinkProps[]
}

interface UnauthMobileMenuProps {
    children: any
    menu_info: MenuSectionProps[]
}

const UnauthMobileMenu = ({children, menu_info}: UnauthMobileMenuProps) => {

    const [showMenu, setShowMenu] = useState<boolean>(false)
    const bodyRef = useRef<HTMLDivElement>(null)

    const menuSpring = useSpring(0)
    const bodyScale = useTransform(menuSpring, [0, 1], [1, 0.8])
    const bodyTranslate = useTransform(menuSpring, (x: number) => {
        return `${200 * x}px`
    })
    const bodyRotate = useTransform(menuSpring, [0, 1], [0, -1])
    const bodyBoxShadow = useTransform(menuSpring, (x: number) =>
    `-8px 0px 20px rgba(0, 0, 0, ${0.15 * x})`)
    const menuVisibilityTransform = useTransform(menuSpring, (x: number) => {
        if (x <= 0.1) return `hidden`
        return `visible`
    })

    useEffect(() => {
        if (showMenu) menuSpring.set(1)
        else menuSpring.set(0)
    }, [showMenu])
    
    useEffect(() => {

        const closeMenu = () => {
            setShowMenu(false);
        }

        if (bodyRef.current) {
            bodyRef.current.addEventListener(`click`, closeMenu)
        }
        
        return () => {
            if (bodyRef.current) bodyRef.current.removeEventListener('click', closeMenu)
        }
    }, [bodyRef])

    return (<div className={`unauth-mobile-menu ${showMenu ? `menu-opened` : ''}`}>
            
            {/* Navbar */}
            <div className="_navbar">
                <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
                    {showMenu ? <HiX /> : <HiMenuAlt2 />}
                </div>
                <div className="logo-icon" />
                <div className="logo-text">offcmpus</div>
            </div>

            <motion.div
                ref={bodyRef}
                style={{
                    scale: bodyScale,
                    translateX: bodyTranslate,
                    boxShadow: bodyBoxShadow,
                    perspective: `6.5cm`,
                    rotateY: bodyRotate
                }}
                className="_body">
                <div className="_navbar-spacer" />
                {children}
            </motion.div>

            <motion.div className="menu-container"
                style={{
                    visibility: menuVisibilityTransform,
                    opacity: menuSpring
                }}
            >
                {menu_info.map((menu_section: MenuSectionProps, i: number) => {
                    return (<div key={i}>
                        <div className="menu-section-header">{menu_section.label}</div>

                        {menu_section.links.map((menu_link: MenuLinkProps, _i: number) => {
                            return (<div key={_i} className="menu-link_">{menu_link.name}</div>)
                        })}
                    </div>)
                })}
            </motion.div>

        </div>)
}

export default UnauthMobileMenu