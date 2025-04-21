
import { useEffect, useState } from "react";  
import { createBrowserRouter, RouterProvider } from "react-router-dom";




type Data = {
  jsonrpc: string;
  id: number;
  result: string;
}

export default function App() {

  const [data, setData] = useState <Data | null>(null);

  useEffect( () => {

    fetch('http://localhost:5556/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [
          "0x0cf0A30167070C3e8c3FF6f9d006910df06f78ea",
          "latest"
        ],
        id: 1
      })
    })
    .then( res => res.json() )
    .then( setData )
    .catch( err => console.error(err) )   
  }, [] )

  if(!data) return <div>Loading...</div>

  return (
    <div>
      {Number(data.result) / 1e18} 
    </div>
  )

}
