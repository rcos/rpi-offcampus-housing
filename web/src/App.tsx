import React from 'react';
import logo from './logo.svg';
import './App.css';

import Centered from './components/toolbox/layout/Centered'
import Toggle from './components/toolbox/form/Toggle'
import Dropdown from './components/toolbox/form/Dropdown'
import RangeSelector from './components/toolbox/form/RangeSelector'

function App() {
  return (
    <Centered width={700} height={600}>

      <div>
        <div className="padded"><Toggle onLabel="Toggle on 123" offLabel="Toggle off" initialValue={true} /></div>
        <div className="padded"><Toggle onLabel="Toggle on 123" offLabel="Toggle off" /></div>
        <div className="padded"><Toggle onLabel="Toggle on 123" offLabel="Toggle off" initialValue={true} /></div>
        <div className="padded" style={{width: '200px'}}>
          <Dropdown options={["Volvo", "Porche", "BMW", "Toyota", "Tesla"]} onSelect={(x:string) => {
            console.log(`Selected: ${x}`)
          }} />
        </div>
        <div className="padded">
          <RangeSelector />
        </div>
      </div>

    </Centered>
  );
}

export default App;
