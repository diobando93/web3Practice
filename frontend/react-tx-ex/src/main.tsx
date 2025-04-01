import { useState, memo, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider, QueryClient, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";


interface IRegister {
  id: string
  name: string
}

const root = document.getElementById('root') as HTMLElement;

interface IItemProps {
  item: IRegister
  deleteRegister: (id: string) => void
}

interface IListProps {
  registers: IRegister[]
  deleteRegister: (id: string) => void
}

const Item: React.FC<IItemProps> = memo(({item, deleteRegister}) => 
  <li>{item.id} {item.name}
    <button onClick={() => deleteRegister(item.id)}>Delete</button>
   </li>)


const ListEx: React.FC<IListProps> = memo(({deleteRegister, registers}) => {
  return <ul>
    {
      registers.map((item: IRegister, index:number) => 
        <Item key={item.id} deleteRegister={deleteRegister} item = {item}></Item>
    )
    }
  </ul>
})

const initialValues: IRegister[] =[
  {
    id: "1",
    name: "prodcut1"
  },
  {
    id: "2",
    name: "prodcut2"
  }
]



const App2 = () => {
  
  const [text, setText] = useState("")
  const [products, setProducts] = useState<IRegister[]>(initialValues)

  const addRegister = () => {
    const newRegister: IRegister = {
      id: new Date().getTime().toString(),
      name: text
    }
    setProducts([...products, newRegister])
  }

  const deleteRegister = useCallback((id: string) => {
    setProducts(products.filter(item => item.id != id))
  }, [products])

  
  return <div> 
            <input type = "text" value = {text} onChange = {(e) => setText(e.target.value)}></input>
            <button onClick={() => addRegister()}>Add</button>
            <ListEx registers = {products} deleteRegister={deleteRegister}/> 
         </div>
}

interface IAppProps {
  id: number
}

const App3: React.FC<IAppProps> = ({id}) => {

  const { data, isLoading, error } = useQuery({
    queryKey: ['post'],
    queryFn: async () => {
      const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
      return res.json();
    }
  });

  if (isLoading) return <div>Loading...</div>

  return <div> {JSON.stringify(data)} </div>
}

const Layout = () => {
  return <div>
    <p> <Link to = "contact" > Contacto </Link></p>
    <p> <Link to = "quiensom" > Nosotros somos </Link></p>
    <p> <Link to = "servicios" > tenemos los siguientes servicios </Link></p>
    <div>
      <Outlet/>
    </div>
    
  </div>  
}

const Servicios = () => {
  return <div>
    <p>Servicios de empresa</p>
    <p> <Link to = "ser1" > Servicio 1 </Link></p>
    <p> <Link to = "ser2" > Servicio 2 </Link></p>
    <p> <Link to = "ser3" > Servicio 3 </Link></p>
    <Outlet></Outlet>
    </div>
}

const App = () => {

  return <BrowserRouter>
    <Routes>
      <Route path="/" element= {<Layout/>}>

        <Route path="contact" element="contacto"></Route>
        <Route path="quiensom" element="somos una empresa etc"></Route>
        <Route path="servicios" element= {<Servicios></Servicios>} >
          <Route index element="servicio por defecto"></Route>
          <Route path="ser1" element="servicio 1"></Route>
          <Route path="ser2" element="servicio 2"></Route>
          <Route path="ser3" element="servicio 3"></Route>
        </Route>
        <Route path="*" element="404"></Route>
      </Route>
    </Routes>
  </BrowserRouter>
}

const queyClient = new QueryClient()

ReactDOM.createRoot(root).render(
  //<QueryClientProvider client = {queyClient}>
  //    <App id={1} />
  //</QueryClientProvider>
 <App/>
);

