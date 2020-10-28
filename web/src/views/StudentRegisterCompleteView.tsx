import React, {useEffect, useState} from 'react'
import Centered from '../components/toolbox/layout/Centered'
import Button from '../components/toolbox/form/Button'
import Input from '../components/toolbox/form/Input'
import CommentBubble from '../components/toolbox/misc/CommentBubble'

import {BiCheck} from "react-icons/bi"

interface IRegData {
  first_name: string
  last_name: string
  email: string
  confirm_email: string
}

const StudentRegisterCompleteView = () => {

  const [regData, setRegData] = useState<IRegData>({
    first_name: "",
    last_name: "",
    email: "",
    confirm_email: ""
  })

  const completeRegistration = () => {
    console.log(`Completing Registration`)
    console.log(`first_name: ${regData.first_name}`)
    console.log(`last_name: ${regData.last_name}`)
    console.log(`email: ${regData.email}`)
    console.log(`confirm_email: ${regData.confirm_email}`)

  }

  return (<Centered width={400} height={500}>
    <div>
      {false && <div style={{marginBottom: "20px"}}>
        <CommentBubble 
          message="Error completing registration. Please make sure all fields are correct."
          header="error"
          color="red"
        />
      </div>}

      <div className="title-1" style={{marginBottom: '20px'}}>Complete Registration</div>

      {/* First And Last Name */}
      <div style={{display: 'flex'}}>
        <div style={{width: '50%', paddingRight: '20px'}}>
          <Input label="First Name" 
            onChange={(val) => {
              let reg2 = regData; 
              reg2.first_name = val;
              setRegData(reg2) 
            }}
          />
        </div>
        <div style={{width: '50%'}}>
        <Input label="Last Name" 
          onChange={(val) => { let reg2 = regData; reg2.last_name = val; setRegData(reg2) }}
        />
        </div>
      </div>

      <div className="padded upper">
        <Input label="Email" 
          onChange={(val) => { let reg2 = regData; reg2.email = val; setRegData(reg2) }}
        />
      </div>

      <div className="padded upper">
        <Input label="Confirm Email" 
          onChange={(val) => { let reg2 = regData; reg2.confirm_email = val; setRegData(reg2) }}
        />
      </div>

      <div className="padded upper" style={{width: "50%", float: "right"}}>
        <Button 
          onClick={completeRegistration}
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