
import { useEffect, useState } from "react";  
import { createBrowserRouter, Outlet, RouterProvider, Link } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Header } from "./components/ui/Header";
import { Dashboard } from "./components/ui/Dashboard";



export function Home() {
  return <div>Home</div>
}

export function Faucet() {
  return <div>Faucet</div>
}

export function Balance() {
  return <div>Balance</div>
}

export function Transfer() {
  return <div>Transfer</div>
}

export function Operaciones() {
  return (
    <div className='container'>
      <div className="flex gap-2 justify-center pt-4">
        <Link to="/operaciones/operacion1"><Button>Operacion 1</Button></Link>
        <Link to="/operaciones/operacion2"><Button>Operacion 2</Button></Link>
        <Link to="/operaciones/operacion3"><Button>Operacion 3</Button></Link>
      </div>
      <h1 className='text-xl'>Operaciones</h1>
      <Outlet/>
    </div>
  )
}

export function Operacion1() {
  return <div>Operacion 1</div>
}
export function Operacion2() {
  return <div>Operacion 2</div>
}
export function Operacion3() {
  return <div>Operacion 3</div>
}

const router = createBrowserRouter([
  {
    path: "/", element: <Dashboard/>,
    children : [
      {path: 'home', element: <Home/>},
      {path: 'faucet', element: <Faucet/>},
      {path: 'balance', element: <Balance/>},
      {path: 'transfer', element: <Transfer/>},
      {path: 'operaciones', element: <Operaciones/>,
        children: [
          {path: 'operacion1', element: <Operacion1/>},
          {path: 'operacion2', element: <Operacion2/>},
          {path: 'operacion3', element: <Operacion3/>},
        ]
      },
    ]  
  }
]);



export default function App() {

 return (
    <RouterProvider router={router} />
 )

}
