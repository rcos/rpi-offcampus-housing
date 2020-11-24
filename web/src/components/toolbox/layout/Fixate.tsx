import React, {useRef} from 'react'

interface IFixate {
  active: boolean
  children: any
}

// TODO Make fixate a top-level component and pass focus through provider & context
const Fixate = ({ active, children }: IFixate) => {

  const relativeRef = useRef<HTMLDivElement>(null)
  const fixateWrapper = () => {
    if (!relativeRef.current) return (<div></div>)

    let bound_ = relativeRef.current.getBoundingClientRect()

    return (<React.Fragment>
      <div style={{
        bottom: bound_.top
      }}></div>
    </React.Fragment>)
  }

  return (<React.Fragment>
    <div className="fixate-test" ref={relativeRef}>{children}</div>
    {fixateWrapper()}
  </React.Fragment>)
}

export default Fixate