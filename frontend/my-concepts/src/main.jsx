import { StrictMode } from 'react'
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


createRoot(document.getElementById('root')).render(
  <div>
    <Likes/>
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