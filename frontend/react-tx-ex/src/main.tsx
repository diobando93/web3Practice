import { useState, memo, useCallback } from "react";
import ReactDOM from "react-dom/client";

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



const App = () => {
  
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

ReactDOM.createRoot(root).render(
  <App />
);

