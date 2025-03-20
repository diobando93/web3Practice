import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CompA from './CompA'
import { CompB } from './CompB'

const Compo2 = (props) => {
    return <p> {props.b} </p>
  }

const Compo = (props) => {
  return (
        <div>
           <p>{props.a} - {props.b}</p>
           <Compo2 b={props.b + 10}/>
        </div>
)
}


createRoot(document.getElementById('root')).render(
  <h1>
    <Compo a="1" b={1}></Compo>
    <Compo a="t" b={5}></Compo>
    <Compo a="j" b={6}></Compo>
    <CompA b = {2} ></CompA> 
    <CompB b = {3} ></CompB> 
  </h1>
)
