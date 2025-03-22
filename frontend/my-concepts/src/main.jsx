import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const funlo = () => "todo"
const farr = () => [1, "f", [2, 3]]
const C2 = () => "componente c2"
const C1 = (props) => <p> <C2/> este es un componente {props.a} </p>


createRoot(document.getElementById('root')).render(
  <h1>
    {2 + 4} {funlo()}
    {farr()}
    <C1 a= {25 + 20} />
    {C1({a:33})}
  </h1>
)
