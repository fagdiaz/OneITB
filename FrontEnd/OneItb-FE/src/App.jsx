import { useState } from 'react';
import { Header } from './Components/layout/public/Header';
import { Routing } from './router/Routing';




function App() {  

  return (
    <div className='layout'>
      <Routing></Routing>
    </div>   
  )
}

export default App
