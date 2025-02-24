import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Home} from './component/Home.jsx'
import {Lista} from './component/Lista.jsx'

//router
import {BrowserRouter, Routes, Route} from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home></Home>}>
          <Route index element = {<p>Inicio</p>}></Route>
          <Route path = "productos" element = {<p>Productos</p>}></Route>
          <Route path = "clientes" element = {<p>Clientes</p>}></Route>
          <Route path = "lista" element = {<Lista></Lista>}></Route>
          <Route path = "*" element = {<p>Ruta no valida</p>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>

  </StrictMode>,
)
