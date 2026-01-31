import { useState } from 'react'
import Calendar from 'react-calendar'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div>
      <Calendar></Calendar>
    </div>
        
    </>
  )
}

export default App
