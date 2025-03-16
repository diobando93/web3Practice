import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const Compo2 = (props) => {
    return <p> {props.b} </p>
  }

const Compo = (props) => {
  return <p>{props.a} - {props.b} <Compo2 b={props.b + 10}></Compo2><p>----</p></p>
}



createRoot(document.getElementById('root')).render(
  <h1>
    <Compo a="1" b={1}></Compo>
    <Compo a="t" b={5}></Compo>
    <Compo a="j" b={6}></Compo>
  </h1>
)
