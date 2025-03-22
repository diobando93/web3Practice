import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const funlo = () => "todo"
const farr = () => [1, "f", [2, 3]]
const C2 = () => "componente c2"
const C1 = (props) => <p> <C2/> este es un componente {props.a} </p>
const lista = ["Madrid", "Barcelona", "Valencia"]
const sesion = null


createRoot(document.getElementById('root')).render(
  <div>
    {sesion && <p>{sesion.usuario}</p>}
    {sesion ? <p> {sesion.usuario} </p> : <p> no hay sesión </p>}
  </div>
)
