import React from 'react';
import logo from './logo.svg';
import './App.css';

import Centered from './components/toolbox/layout/Centered'
import Toggle from './components/toolbox/form/Toggle'

function App() {
  return (
    <Centered width={700} height={600}>

      <Toggle onLabel="Toggle on 123" offLabel="Toggle off" initialValue={true} />

    </Centered>
  );
}

export default App;
