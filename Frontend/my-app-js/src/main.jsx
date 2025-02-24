import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Home} from './component/Home.jsx'
import {Lista} from './component/Lista.jsx'
import {Tx} from './component/Tx.jsx'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

//router
import {BrowserRouter, Routes, Route} from 'react-router-dom'
//query client
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client = {queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home></Home>}>
          <Route index element = {<p>Inicio</p>}></Route>
          <Route path = "productos" element = {<p>Productos</p>}></Route>
          <Route path = "clientes" element = {<p>Clientes</p>}></Route>
          <Route path = "lista" element = {<Lista></Lista>}></Route>
          <Route path = "tx" element = {<Tx></Tx>}></Route>
          <Route path = "*" element = {<p>Ruta no valida</p>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
