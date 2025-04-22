
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard } from "./components/ui/Dashboard";
import { Home } from "./components/ui/Home";
import { Transfer } from "./components/ui/Transfer";
import { Balance } from "./components/ui/Balance";
import { Faucet } from "./components/ui/Faucet";
import { createContext, useState} from "react";


const router = createBrowserRouter([
  {
    path: "/", element: <Dashboard/>,
    children : [
      {path: 'home', element: <Home/>},
      {path: 'faucet', element: <Faucet/>},
      {path: 'balance', element: <Balance/>},
      {path: 'transfer', element: <Transfer/>}
    ]  
  }
]);

export const UserContext = createContext({});

export default function App() {

  const [state, setState] = useState({
    acc: ""
  });

  return <UserContext.Provider value={{ state, setState }}> 
    <RouterProvider router={router} />
  </UserContext.Provider>

}
