import ReactDOM from 'react-dom/client'


import Booking from './pages/Booking.tsx'
import Home from './pages/Home.tsx'

import Rooms  from './pages/Rooms/Index.tsx';
import Room  from './pages/Rooms/Detail.tsx';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
      <Routes>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/booking' element={<Booking/>}></Route>
          <Route path='/rooms/:appId' element={<Rooms/>}></Route>
          <Route path='/rooms/:appId/:id' element={<Room/>}></Route>
      </Routes>
  </BrowserRouter>,
)
