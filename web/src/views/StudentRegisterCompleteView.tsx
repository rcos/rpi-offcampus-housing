import React from 'react'
import Centered from '../components/toolbox/layout/Centered'
import Button from '../components/toolbox/form/Button'
import Input from '../components/toolbox/form/Input'

import {BiCheck} from "react-icons/bi"

const StudentRegisterCompleteView = () => {

  return (<Centered width={400} height={500}>
    <div>

    <div className="title-1" style={{marginBottom: '20px'}}>Complete Registration</div>

    {/* First And Last Name */}
    <div style={{display: 'flex'}}>
      <div style={{width: '50%', paddingRight: '20px'}}>
        <Input label="First Name" />
      </div>
      <div style={{width: '50%'}}>
       <Input label="Last Name" />
      </div>
    </div>

    <div className="padded upper">
      <Input label="Email" />
    </div>

    <div className="padded upper">
      <Input label="Confirm Email" />
    </div>

    <div className="padded upper" style={{width: "50%", float: "right"}}>
      <Button 
        text="Complete"
        icon={<BiCheck />}
        iconLocation="right"
        background="#63db97"
      />
    </div>

    </div>
  </Centered>)
}

export default StudentRegisterCompleteView