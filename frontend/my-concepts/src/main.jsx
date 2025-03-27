import { StrictMode, useEffect, createContext, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import React, { useState } from 'react';

const funlo = () => "todo"
const farr = () => [1, "f", [2, 3]]
const C2 = () => "componente c2"
const C1 = (props) => <p> <C2/> este es un componente {props.a} </p>
const lista = ["Madrid", "Barcelona", "Valencia"]
const sesion = null
const GlobalContext = createContext()

function Likes(props){
  const [likes, setLikes] = useState(0);
  console.log("render", likes);
  function increment(){
    setLikes(likes + 1);
  }
  return <button onClick={() => increment()}> Likes {likes} </button>
}

const Post = ({numero}) => {

  const [data, setDatta] = useState(null)
  const [c, setC] = useState(0)
  
  useEffect(() => {
        fetch(`https://jsonplaceholder.typicode.com/posts/${numero}`)
        .then(response => response.json())
        .then(data => setDatta(data))
  }, [])
  //[] esta dependencia en el useEffect hace que solo se ejecute una vez, esto es una dependencia.
  
  if(!data) return <div>
     Cargando el post {numero} 
    <hr></hr>
    </div>
  

  return <div> 
    <button onClick={() => setC(c + 1)}> Sumar {c} </button>
    Post {numero} 
  {JSON.stringify(data)}
  <hr></hr>
  </div>
}

const App = () => {
  return <div>
    <Post numero={1}></Post>
    <Post numero={2}></Post>
    <Post numero={3}></Post>
    <Post numero={4}></Post>
  </div>
}

// Hook personalizado
// creando hook, funcion que devuelve un resultado
const useContador = (numero) => {
  const [c, setC] = useState(numero)
  const incrementar = () => setC(c + 1)
  const decrementar = () => setC(c - 1)
  const reset = () => setC(0)
  
  return {
    c,
    incrementar,
    decrementar,
    reset
  }
}

// Modo tradicional
const App2 = () => {
  //const [c, setC] = useState(0)
  //const incrementar = () => setC(c + 1)
  //const decrementar = () => setC(c - 1)
  //const reset = () => setC(0)
  const {c: contador, incrementar, decrementar, reset} = useContador(5)
  const {c: contador1, incrementar1, decrementar1, reset1} = useContador(54)
  return <div>
    {contador}
    <button onClick={() => incrementar()}> Incrementar </button>
    <button onClick={() => decrementar()}> decrementar </button>
    <button onClick={() => reset()}> reset </button>
    <hr></hr>
    {contador1}
    <button onClick={() => incrementar1()}> Incrementar </button>
    <button onClick={() => decrementar1()}> decrementar </button>
    <button onClick={() => reset1()}> reset </button>
  </div>
}

// Gobal context
const AppGlobal = ({children}) => {
  const [estado, setEstado] = useState({
    usuario: "user1"
  })
  return <GlobalContext.Provider value = {[estado, setEstado]}>
    {children}
  </GlobalContext.Provider>
}

const Child = () => {
  const [global, setGlobal] = useContext(GlobalContext)
  return <div>
    usu: {global.usuario}
    <Child2> </Child2> 
  </div>
}


const Child2 = () => {
  const [global, setGlobal] = useContext(GlobalContext)
  const change = () => {
    setGlobal({...global, usuario: "user2"})
  }
  return <div>
    soy el nieto: {global.usuario}
    <button onClick={() => {change()}}> Cambiar </button>
  </div>
}

createRoot(document.getElementById('root')).render(
  <div>
    <Likes/>
    <App/>
    <App2/>
    <AppGlobal>
      <h1>hola</h1>
      <h2>hola de nuevo</h2>
      <Child/>
    </AppGlobal>
  </div>
)

/*
function Likes(props){
  //let likes = 0;
  const [likes, setLikes] = useState(0);
  console.log("render", likes);
  function increment(){
    //likes++;
    //console.log(likes);
    setLikes(likes + 1);
  }
  return <button onClick={() =>increment()}> Likes {likes} </button>
}

*/