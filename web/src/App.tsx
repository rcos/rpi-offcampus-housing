import React from 'react';
import logo from './logo.svg';
import './App.css';

import Centered from './components/toolbox/layout/Centered'
import Toggle from './components/toolbox/form/Toggle'
import Dropdown from './components/toolbox/form/Dropdown'
import RangeSelector from './components/toolbox/form/RangeSelector'
import LeftAndRight from './components/toolbox/layout/LeftAndRight'
import Logo from './components/Logo'
import Button from './components/toolbox/form/Button';
import {BiHomeCircle, BiLogIn} from 'react-icons/bi'
import Input from './components/toolbox/form/Input'

function App() {
  return (
    <Centered width={700} height={600}>

      <div>
        <div className="padded"><Toggle onLabel="Toggle on 123" offLabel="Toggle off" initialValue={true} /></div>
        <div className="padded"><Toggle onLabel="Toggle on 123" offLabel="Toggle off" /></div>
        <div className="padded"><Toggle onLabel="Toggle on 123" offLabel="Toggle off" initialValue={true} /></div>
        <div className="padded" style={{width: '200px'}}>
          <Dropdown options={["Volvo", "Porche", "BMW", "Toyota", "Tesla"]} onSelect={(index: number) => {
            console.log(`Selected Index: ${index}`)
          }} />
        </div>
        <div className="padded">
        </div>
        <div className="padded">
          <LeftAndRight 
            left={<div><Logo /></div>}
            right={<Button
              background="white"
              textColor="black"
              border="black"
              text="Home"
              iconLocation="left"
              icon={<BiHomeCircle/>}
              onClick={() => {
                console.log(`clicked!`)
              }}
            />}
          />
        </div>
        <div className="padded" style={{width: '60%'}}>
          <Input 
            label="Username"
          />
        </div>
        <div className="padded" style={{width: '60%'}}>
          <Input 
            label="Password"
            type="password"
          />
        </div>
        <div style={{width: '60%'}}>
          <LeftAndRight 
            left={<Button 
              background="#d6d6d6"
              text-color="black"
              text="Cancel"
            />}
            right={<Button 
              background="#8F3985"
              text-color="white"
              text="Login"
              icon={<BiLogIn />}
              iconLocation="right"
            />}
          />
        </div>
      </div>

    </Centered>
  );
}

export default App;
