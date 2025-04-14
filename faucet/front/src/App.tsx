import { useEffect, useState } from "react";  

type Data = {
  p1: string;
  p2: string;
}

export default function App() {

  const [data, setData] = useState <Data | null>(null);

  useEffect( () => {

    fetch( "http://localhost:3333/112/34543" )
      .then( ( response ) => response.json() )
      .then( ( data => setData(data) ) )

  }, [] )

  if(!data) return <div>Loading...</div>

  return (
    <div>
      {data.p1} {data.p2}
    </div>
  )

}
