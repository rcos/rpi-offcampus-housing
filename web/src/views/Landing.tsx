import React from 'react'
import {useHistory} from 'react-router-dom'

import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import Logo from '../components/Logo'
import Button from '../components/toolbox/form/Button'
import {BiLogIn} from 'react-icons/bi'
import Centered from '../components/toolbox/layout/Centered'
import SuggestionInput from '../components/toolbox/form/SuggestionInput'
import Input from '../components/toolbox/form/Input'

const SearchView = () => {
  const history = useHistory()

  return (<div>
    
    <Centered width={1400} height="100%">
      <React.Fragment>

        <div style={{marginTop: `20px`}}></div>
        <LeftAndRight 
            left={<Logo />}
            right={<Button 
              text="Login"
              icon={<BiLogIn/>}
              background="#1E2019"
              textColor="white"
              iconLocation="right"
              onClick={() => history.push('/landlord/login')}
            />}
          />

          <div style={{width: `400px`, marginTop: `30px`}}>
            <div style={{marginBottom: '20px'}}>
              <Input label="Sample" />
            </div>

            <SuggestionInput
              label="School"
              onChange={(val: string): string[] => {
                if (val.length == 0) return []
                let schools=["Rensselaer Polytechnic Institute", "Rochester Institute of Technology", "Rutgers"]

                return schools.filter(school_ => {
                  return school_.toLowerCase().includes(val.toLowerCase())
                })

              }}
            />
          </div>

      </React.Fragment>
    </Centered>

  </div>)
}

export default SearchView