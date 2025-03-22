import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import React, { useState } from 'react';

const funlo = () => "todo"
const farr = () => [1, "f", [2, 3]]
const C2 = () => "componente c2"
const C1 = (props) => <p> <C2/> este es un componente {props.a} </p>
const lista = ["Madrid", "Barcelona", "Valencia"]
const sesion = null

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
  //[] esta dependencia en el useEffect hace que solo se ejecute una vez
  
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


createRoot(document.getElementById('root')).render(
  <div>
    <Likes/>
    <App/>
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