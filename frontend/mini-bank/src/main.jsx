import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './components/Home';
import { Producto } from './components/Producto';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client = {queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home></Home>}> 
          <Route path="/productos" element={<Producto></Producto>}/>
          <Route path="/balance" element={<h1>balance</h1>}/>
        </Route>
      </Routes> 
    </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
