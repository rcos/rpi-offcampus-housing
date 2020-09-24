import React from 'react';
import logo from './logo.svg';
import './App.css';

import Centered from './components/toolbox/layout/Centered'
import Toggle from './components/toolbox/form/Toggle'
import Dropdown from './components/toolbox/form/Dropdown'

function App() {
  return (
    <Centered width={700} height={600}>

      <div>
        <div><Toggle onLabel="Toggle on 123" offLabel="Toggle off" initialValue={true} /></div>
        <div><Toggle onLabel="Toggle on 123" offLabel="Toggle off" /></div>
        <div><Toggle onLabel="Toggle on 123" offLabel="Toggle off" initialValue={true} /></div>
        <div style={{width: '200px'}}>
          <Dropdown options={["Volvo", "Porche", "BMW", "Toyota", "Tesla"]} onSelect={(x:string) => {
            console.log(`Selected: ${x}`)
          }} />
        </div>
      </div>

    </Centered>
  );
}

export default App;
