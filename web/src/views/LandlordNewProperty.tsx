import React, {useState} from 'react'
import {useMediaQuery} from 'react-responsive'

import {BiHomeAlt} from 'react-icons/bi'
import {BsAt} from 'react-icons/bs'
import {HiArrowRight} from 'react-icons/hi'
import Input from '../components/toolbox/form/Input'
import Button from '../components/toolbox/form/Button'
import CommentBubble from '../components/toolbox/misc/CommentBubble'
import Centered from '../components/toolbox/layout/Centered'


interface IFormError {
  hasError: boolean
  message?: string
}

const LandlordNewProperty = () => {

  const [formError, setFormError] = useState<IFormError>({
    hasError: false
  })

  const isMobile = useMediaQuery({ query: '(max-width: 500px)' })
  return (<Centered width={isMobile ? 300 : 400} height={500}>
    <div>
      {formError.hasError && <div style={{marginBottom: "20px"}}>
        <CommentBubble 
          message={formError.message ? formError.message : ""}
          header="error"
          color="red"
        />
      </div>}

      <div className="title-1" style={{marginBottom: '20px'}}>Property Registration</div>

      {/* First And Last Name */}

      <div className="padded upper">
        <Input label="Location" 
          icon={<BiHomeAlt />}
          onChange={(val) => { /*let reg2 = regData; reg2.confirm_email = val; setRegData(reg2)*/ }}
        />
      </div>

      <div className="padded upper" style={{width: "50%", float: "right"}}>
        <Button 
          onClick={() => {

          }}
          text="Next"
          icon={<HiArrowRight />}
          iconLocation="right"
          background="#63db97"
        />
      </div>

    </div>
  </Centered>)
}

export default LandlordNewProperty